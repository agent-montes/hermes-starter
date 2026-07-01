import electron from "electron";
import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import dns from "node:dns";

const { app, BrowserWindow, ipcMain, session, nativeImage, Menu } = electron;

// Some local macOS resolver configurations fail getaddrinfo() for
// generativelanguage.googleapis.com even when nslookup succeeds. Keep the
// workaround inside J.A.R.V.I.S. instead of changing /etc/hosts.
const originalDnsLookup = dns.lookup;
dns.lookup = function jarvisDnsLookup(hostname, options, callback) {
  if (hostname === "generativelanguage.googleapis.com") {
    if (typeof options === "function") return options(null, "216.239.38.223", 4);
    if (options && options.all) return callback(null, [{ address: "216.239.38.223", family: 4 }]);
    return callback(null, "216.239.38.223", 4);
  }
  return originalDnsLookup.call(this, hostname, options, callback);
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

// Name the app "J.A.R.V.I.S." (menu bar / about panel). The Dock tile fully reflects this
// only in a packaged build; in dev the generic Electron bundle name is used.
app.setName("J.A.R.V.I.S.");

const iconPath = path.join(repoRoot, "build", "icon.png");
const appIcon = fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : null;

function parseEnvFile(envPath) {
  if (!envPath || !fs.existsSync(envPath)) return;
  const contents = fs.readFileSync(envPath, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) continue;
    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();
    if (!key || process.env[key]) continue;
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

// Look for .env in several places so both the dev repo run and a packaged
// J.A.R.V.I.S. app can find credentials. First match for a given key wins.
function loadEnvFile() {
  const resourcesEnv = process.resourcesPath ? path.join(process.resourcesPath, ".env") : null;
  const localPackagedRepoEnv = process.resourcesPath
    ? path.resolve(process.resourcesPath, "../../../../..", ".env")
    : null;
  const candidates = [
    path.join(repoRoot, ".env"),
    path.join(os.homedir(), ".jarvis", ".env"),
    resourcesEnv,
    localPackagedRepoEnv,
  ];
  for (const candidate of candidates) parseEnvFile(candidate);
}

loadEnvFile();

let mainWindow = null;
let liveSession = null;
let ai = null;
let liveStatus = { running: false, pid: null };
let isQuitting = false;
let userTranscriptBuffer = "";
let modelTranscriptBuffer = "";
const hermesRuns = new Map();
const pendingHermesAnnouncements = [];
let wakeState = {
  running: false,
  configured: false,
  engine: "openwakeword",
  keyword: "hey jarvis",
  threshold: 0.35,
  error: null,
};
const wakeRuntime = {
  process: null,
  active: false,
  stdoutBuffer: "",
  stderrBuffer: "",
  lastDetectionAt: 0,
};

function emitToRenderer(channel, payload) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send(channel, payload);
}

function emitEvent(event) {
  emitToRenderer("sidecar:event", { timestamp: Date.now() / 1000, ...event });
}

function flushTranscripts() {
  if (userTranscriptBuffer.trim()) {
    emitEvent({ type: "transcript", speaker: "you", text: userTranscriptBuffer.trim() });
  }
  if (modelTranscriptBuffer.trim()) {
    emitEvent({ type: "transcript", speaker: "assistant", text: modelTranscriptBuffer.trim() });
  }
  userTranscriptBuffer = "";
  modelTranscriptBuffer = "";
}

function hermesBaseUrl() {
  return process.env.HERMES_API_URL || "http://127.0.0.1:8642";
}

function hermesApiKey() {
  const key = process.env.API_SERVER_KEY || process.env.HERMES_API_SERVER_KEY || "";
  if (!key) throw new Error("API_SERVER_KEY is not set");
  return key;
}

function hermesHeaders() {
  return {
    Authorization: `Bearer ${hermesApiKey()}`,
    "Content-Type": "application/json",
  };
}

function userDisplayName() {
  return (process.env.JARVIS_USER_NAME || process.env.USER || process.env.USERNAME || "there").trim();
}

function safeErrorMessage(error) {
  let message = error instanceof Error ? error.message : String(error || "Unknown error");
  for (const key of ["GEMINI_API_KEY", "API_SERVER_KEY"]) {
    const value = process.env[key];
    if (value && value.length >= 8) message = message.split(value).join("[REDACTED]");
  }
  return message;
}

function parseEnabled(value, defaultValue = true) {
  if (value === undefined || value === null || value === "") return defaultValue;
  return !/^(0|false|no|off)$/i.test(String(value).trim());
}

function localRepoRootFromPackagedResources() {
  return process.resourcesPath ? path.resolve(process.resourcesPath, "../../../../..") : null;
}

function existingPath(...candidates) {
  return candidates.find((candidate) => candidate && fs.existsSync(candidate)) || null;
}

function wakeConfig() {
  const threshold = Number.parseFloat(process.env.OPENWAKEWORD_THRESHOLD || "0.35");
  const vadThreshold = Number.parseFloat(process.env.OPENWAKEWORD_VAD_THRESHOLD || "0");
  const localPackagedRoot = localRepoRootFromPackagedResources();
  const workdir = localPackagedRoot && fs.existsSync(path.join(localPackagedRoot, "package.json"))
    ? localPackagedRoot
    : repoRoot;
  const python = existingPath(
    process.env.OPENWAKEWORD_PYTHON,
    path.join(repoRoot, ".venv-openwakeword", "bin", "python"),
    localPackagedRoot && path.join(localPackagedRoot, ".venv-openwakeword", "bin", "python"),
    path.join(os.homedir(), ".jarvis", ".venv-openwakeword", "bin", "python"),
  ) || "python3";
  const script = existingPath(
    process.env.OPENWAKEWORD_SCRIPT,
    process.resourcesPath && path.join(process.resourcesPath, "scripts", "openwakeword-listener.py"),
    path.join(repoRoot, "scripts", "openwakeword-listener.py"),
    localPackagedRoot && path.join(localPackagedRoot, "scripts", "openwakeword-listener.py"),
  );
  const model = String(process.env.OPENWAKEWORD_MODEL || "hey_jarvis").trim() || "hey_jarvis";
  return {
    enabled: parseEnabled(process.env.OPENWAKEWORD_WAKE_ENABLED, true),
    engine: "openwakeword",
    model,
    keyword: model.replace(/[_-]+/g, " "),
    threshold: Number.isFinite(threshold) ? Math.min(1, Math.max(0, threshold)) : 0.35,
    vadThreshold: Number.isFinite(vadThreshold) ? Math.min(1, Math.max(0, vadThreshold)) : 0,
    python,
    script,
    workdir,
  };
}

function updateWakeState(update) {
  wakeState = { ...wakeState, ...update };
  emitEvent({ type: "wake_status", status: wakeState });
  return wakeState;
}

function releaseWakeResources() {
  wakeRuntime.active = false;
  const child = wakeRuntime.process;
  wakeRuntime.process = null;
  wakeRuntime.stdoutBuffer = "";
  wakeRuntime.stderrBuffer = "";
  if (child && !child.killed) {
    try { child.stdin?.end(); } catch { /* ignore */ }
    try { child.kill(); } catch { /* ignore */ }
  }
}

function stopWakeListener({ reason = "stopped", emit = true } = {}) {
  releaseWakeResources();
  if (emit) updateWakeState({ running: false, error: null, reason });
  return wakeState;
}

function handleOpenWakeWordLine(line) {
  if (!line.trim()) return;
  let event;
  try {
    event = JSON.parse(line);
  } catch {
    emitEvent({ type: "log", level: "info", message: `openWakeWord: ${line.slice(0, 160)}` });
    return;
  }

  if (event.type === "ready") {
    updateWakeState({
      running: true,
      configured: true,
      engine: "openwakeword",
      keyword: String(event.keyword || event.model || wakeState.keyword).replace(/[_-]+/g, " "),
      threshold: Number(event.threshold || wakeState.threshold),
      error: null,
      reason: "listening",
    });
    emitEvent({ type: "log", level: "info", message: `openWakeWord listening for ${wakeState.keyword}.` });
    return;
  }

  if (event.type === "wakeword") {
    const now = Date.now();
    if (now - wakeRuntime.lastDetectionAt < 3500) return;
    wakeRuntime.lastDetectionAt = now;
    const keyword = String(event.keyword || wakeState.keyword || "hey jarvis");
    emitEvent({ type: "wake_detected", keyword, score: event.score, engine: "openwakeword" });
    emitToRenderer("ui:wake-shortcut", { action: "wake", source: "openwakeword", keyword, score: event.score });
    return;
  }

  if (event.type === "error") {
    updateWakeState({ running: false, configured: true, error: safeErrorMessage(event.error), reason: "error" });
  }
}

function appendWakeOutput(chunk) {
  wakeRuntime.stdoutBuffer += chunk.toString("utf8");
  let newlineIndex;
  while ((newlineIndex = wakeRuntime.stdoutBuffer.indexOf("\n")) >= 0) {
    const line = wakeRuntime.stdoutBuffer.slice(0, newlineIndex);
    wakeRuntime.stdoutBuffer = wakeRuntime.stdoutBuffer.slice(newlineIndex + 1);
    handleOpenWakeWordLine(line);
  }
}

function appendWakeError(chunk) {
  wakeRuntime.stderrBuffer = `${wakeRuntime.stderrBuffer}${chunk.toString("utf8")}`.slice(-1000);
}

async function startWakeListener() {
  const config = wakeConfig();
  if (wakeRuntime.active) return wakeState;
  if (!config.enabled) {
    return updateWakeState({ running: false, configured: false, engine: config.engine, keyword: config.keyword, threshold: config.threshold, error: "Wake word disabled", reason: "disabled" });
  }
  if (!config.script) {
    return updateWakeState({ running: false, configured: false, engine: config.engine, keyword: config.keyword, threshold: config.threshold, error: "openWakeWord helper script not found. Run the local wake-word setup first.", reason: "missing_helper" });
  }

  try {
    const child = spawn(config.python, [
      config.script,
      "--model", config.model,
      "--threshold", String(config.threshold),
      "--vad-threshold", String(config.vadThreshold),
    ], {
      cwd: config.workdir,
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
      stdio: ["pipe", "pipe", "pipe"],
    });

    wakeRuntime.process = child;
    wakeRuntime.active = true;
    wakeRuntime.stdoutBuffer = "";
    wakeRuntime.stderrBuffer = "";
    updateWakeState({ running: false, configured: true, engine: config.engine, keyword: config.keyword, threshold: config.threshold, error: null, reason: "starting" });

    child.stdout.on("data", appendWakeOutput);
    child.stderr.on("data", appendWakeError);
    child.on("error", (error) => {
      releaseWakeResources();
      updateWakeState({ running: false, configured: true, error: safeErrorMessage(error), reason: "error" });
    });
    child.on("exit", (code, signal) => {
      const intentional = !wakeRuntime.active || isQuitting || reasonForStoppedVoice();
      wakeRuntime.process = null;
      wakeRuntime.active = false;
      if (!intentional && code !== 0) {
        const detail = wakeRuntime.stderrBuffer.trim() || `openWakeWord exited with code ${code}${signal ? ` (${signal})` : ""}`;
        updateWakeState({ running: false, configured: true, error: safeErrorMessage(detail), reason: "error" });
      }
    });
  } catch (error) {
    releaseWakeResources();
    return updateWakeState({ running: false, configured: true, engine: config.engine, keyword: config.keyword, threshold: config.threshold, error: safeErrorMessage(error), reason: "error" });
  }

  return wakeState;
}

function reasonForStoppedVoice() {
  return Boolean(liveSession);
}

function sendWakeAudioChunk(arrayBuffer) {
  const child = wakeRuntime.process;
  if (!wakeRuntime.active || !child?.stdin || liveSession || !arrayBuffer) return;
  const buffer = Buffer.from(new Uint8Array(arrayBuffer));
  if (!buffer.byteLength) return;
  try {
    child.stdin.write(buffer);
  } catch (error) {
    updateWakeState({ running: false, configured: true, error: safeErrorMessage(error), reason: "error" });
  }
}

function updateWakeAudioStatus(status = {}) {
  if (status.status === "error") {
    return updateWakeState({ error: safeErrorMessage(status.error || "Wake microphone capture failed"), reason: "microphone_error" });
  }
  if (status.status === "listening") {
    return updateWakeState({ error: null, reason: "listening" });
  }
  return wakeState;
}

async function restartWakeListenerSoon() {
  if (isQuitting) return;
  const config = wakeConfig();
  if (!config.enabled || liveSession) return;
  setTimeout(() => {
    if (!isQuitting && !liveSession) startWakeListener().catch((error) => {
      updateWakeState({ running: false, error: safeErrorMessage(error), reason: "error" });
    });
  }, 1000);
}

async function hermesRequest(method, pathName, body = undefined) {
  const response = await fetch(`${hermesBaseUrl()}${pathName}`, {
    method,
    headers: hermesHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let json = {};
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { text };
    }
  }
  if (!response.ok) {
    throw new Error(`Hermes ${response.status}: ${text || response.statusText}`);
  }
  return json;
}

async function checkHermesStatus() {
  try {
    const health = await hermesRequest("GET", "/health");
    emitEvent({ type: "hermes_status", status: "ready", detail: health });
    return { reachable: true, health };
  } catch (error) {
    emitEvent({ type: "hermes_status", status: "error", error: error.message });
    return { reachable: false, error: error.message };
  }
}

async function submitHermesTask({ task, session_id = "jarvis-voice", urgency = "normal" }) {
  if (!task || !String(task).trim()) {
    return { status: "error", error: "Task is required." };
  }
  const cleanTask = String(task).trim();
  emitEvent({ type: "hermes_task_update", status: "starting", task: cleanTask });
  const run = await hermesRequest("POST", "/v1/runs", {
    input: cleanTask,
    session_id,
    instructions:
      "You are invoked from J.A.R.V.I.S. voice. Work autonomously. Do not ask J.A.R.V.I.S. for clarification unless absolutely impossible. Use sensible defaults and report concise final results.",
  });
  const runId = run.run_id || run.id;
  emitEvent({ type: "hermes_task_update", status: "started", task: cleanTask, run_id: runId, urgency });
  if (runId) watchHermesRun(runId, cleanTask);
  return { status: "started", run_id: runId, message: "Hermes has started the task." };
}

async function getHermesTaskStatus({ run_id }) {
  return hermesRequest("GET", `/v1/runs/${run_id}`);
}

async function stopHermesTask({ run_id }) {
  return hermesRequest("POST", `/v1/runs/${run_id}/stop`, {});
}

async function approveHermesAction({ run_id, choice }) {
  return hermesRequest("POST", `/v1/runs/${run_id}/approval`, { choice });
}

async function executeHermesTool(name, args = {}) {
  switch (name) {
    case "check_hermes_status":
      return checkHermesStatus();
    case "submit_hermes_task":
      return submitHermesTask(args);
    case "get_hermes_task_status":
      return getHermesTaskStatus(args);
    case "stop_hermes_task":
      return stopHermesTask(args);
    case "approve_hermes_action":
      return approveHermesAction(args);
    default:
      return { status: "error", error: `Unknown tool: ${name}` };
  }
}

async function watchHermesRun(runId, task) {
  if (hermesRuns.has(runId)) return;
  hermesRuns.set(runId, true);
  const terminal = new Set(["completed", "failed", "cancelled", "canceled", "error"]);
  let lastStatus = "";
  try {
    while (hermesRuns.has(runId)) {
      const run = await hermesRequest("GET", `/v1/runs/${runId}`);
      const status = String(run.status || "unknown");
      if (status !== lastStatus) {
        emitEvent({ type: "hermes_task_update", status, run_id: runId, task, run });
        lastStatus = status;
      }
      if (terminal.has(status)) {
        const output = run.output || run.final_response || "";
        emitEvent({ type: "hermes_task_update", status, run_id: runId, task, output });
        announceHermesCompletion({
          runId,
          task,
          status,
          output: String(output || "").slice(0, 2500),
        });
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  } catch (error) {
    emitEvent({ type: "hermes_task_update", status: "error", run_id: runId, task, error: error.message });
  } finally {
    hermesRuns.delete(runId);
  }
}

function announceHermesCompletion({ runId, task, status, output }) {
  const eventText = [
    "SYSTEM_EVENT_HERMES_COMPLETE",
    `run_id: ${runId}`,
    `status: ${status}`,
    `original_task: ${task}`,
    "instructions_to_jarvis:",
    `- Proactively tell ${userDisplayName()} Hermes has returned.`,
    "- If another conversation is in progress, politely pause it with a short bridge like: Quick update, Hermes is back with a result.",
    "- Give a concise spoken summary in 1-3 sentences.",
    "- Ask whether he wants to go through the details before continuing the current conversation.",
    "- Do not say you personally did the work; Hermes did.",
    "hermes_result:",
    output || "(Hermes returned no text output.)",
  ].join("\n");

  emitEvent({
    type: "hermes_completion",
    run_id: runId,
    task,
    status,
    output,
  });

  if (liveSession) {
    liveSession.sendRealtimeInput({ text: eventText });
  } else {
    pendingHermesAnnouncements.push(eventText);
  }
}

function buildHermesTools() {
  return [
    {
      functionDeclarations: [
        {
          name: "check_hermes_status",
          description: "Check if Hermes local API is reachable. Use this for questions about Hermes status.",
          parameters: { type: "object", properties: {} },
        },
        {
          name: "submit_hermes_task",
          description:
            "Immediately hand actionable work to Hermes. Invoke for deals, shopping, research, coding, file work, terminal tasks, summaries, automations, or anything requiring tools. Do not ask the user clarifying questions first. IMPORTANT: Hermes cannot see this voice conversation — the 'task' string is the ONLY context it gets. So you must write a complete, self-contained brief, not a short paraphrase.",
          parameters: {
            type: "object",
            properties: {
              task: {
                type: "string",
                description:
                  "A complete, self-contained task brief for Hermes written in clear English. Expand the user's spoken request into a precise instruction: include the goal, every concrete detail the user gave (names, numbers, URLs, dates, budgets, preferences, constraints), any sensible defaults you assumed, and the expected output/format. Do NOT compress it into a few words; write the full task as if Hermes has no prior context.",
              },
              session_id: { type: "string", description: "Stable session id. Default jarvis-voice." },
              urgency: { type: "string", description: "low, normal, or high." },
            },
            required: ["task"],
          },
        },
        {
          name: "get_hermes_task_status",
          description: "Fetch the latest status for a Hermes run.",
          parameters: {
            type: "object",
            properties: { run_id: { type: "string" } },
            required: ["run_id"],
          },
        },
        {
          name: "stop_hermes_task",
          description: "Stop an active Hermes run.",
          parameters: {
            type: "object",
            properties: { run_id: { type: "string" } },
            required: ["run_id"],
          },
        },
        {
          name: "approve_hermes_action",
          description: "Resolve a Hermes approval request.",
          parameters: {
            type: "object",
            properties: {
              run_id: { type: "string" },
              choice: { type: "string", description: "once, session, always, or deny" },
            },
            required: ["run_id", "choice"],
          },
        },
      ],
    },
  ];
}

function buildLiveConfig() {
  return {
    responseModalities: ["AUDIO"],
    mediaResolution: "MEDIA_RESOLUTION_MEDIUM",
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: process.env.GEMINI_LIVE_VOICE || "Leda",
        },
      },
    },
    contextWindowCompression: {
      triggerTokens: 104857,
      slidingWindow: { targetTokens: 52428 },
    },
    inputAudioTranscription: {},
    outputAudioTranscription: {},
    tools: [
      { googleSearch: {} },
      ...buildHermesTools(),
    ],
    systemInstruction: {
      parts: [
        {
          text: [
            `You are J.A.R.V.I.S., the realtime voice front-end for ${userDisplayName()}.`,
            "Hermes is your worker brain for tools, terminal, files, web, deals, coding, research, and automations.",
            "You also have built-in Google Search. Use Google Search directly for quick current facts, simple web lookups, and lightweight questions that do not need Hermes to do work.",
            `CRITICAL: Be decisive. Do not ask clarifying questions for actionable tasks. If ${userDisplayName()} asks for a deal, research, coding, checking something, building something, or any work, immediately call submit_hermes_task with the request.`,
            "Routing rule: quick answer or fact lookup -> Google Search; multi-step work, monitoring, files, email, deals, coding, automation, or anything that should continue in the background -> Hermes.",
            `When you call submit_hermes_task, write the 'task' as a COMPLETE, self-contained brief. Hermes cannot hear this conversation, so do not send a short paraphrase. Expand what ${userDisplayName()} said into a precise, detailed instruction that captures the goal, every concrete detail mentioned (names, numbers, URLs, dates, budgets, preferences, constraints), any reasonable defaults you are assuming, and the expected result/format. Write it as if Hermes has zero prior context.`,
            `After submit_hermes_task returns, say one short acknowledgement like: On it, Hermes is handling that now. (Keep what you SAY to ${userDisplayName()} short, even though the task you SENT to Hermes is detailed.)`,
            `When you receive SYSTEM_EVENT_SESSION_START, immediately speak a warm welcome-back greeting to ${userDisplayName()} as instructed, without waiting for the user to talk first.`,
            `When you receive SYSTEM_EVENT_HERMES_COMPLETE, treat it as a high-priority background result from Hermes. Proactively announce it even if ${userDisplayName()} was chatting with you. Keep it polite and short: say Hermes is back, summarize the result, and ask whether they want to go through it before continuing.`,
            "Only answer directly for greetings, quick chat, or status questions.",
            "Keep voice responses natural and short.",
          ].join("\n"),
        },
      ],
    },
  };
}

function sendWelcomeGreeting() {
  (async () => {
    let reachable = false;
    try {
      const status = await checkHermesStatus();
      reachable = Boolean(status.reachable);
    } catch {
      reachable = false;
    }
    if (!liveSession) return;

    const hermesLine = reachable
      ? "Hermes is online and all channels are connected, so we're good to go."
      : "I'm still bringing Hermes online, channels are connecting now.";

    const greeting =
      `SYSTEM_EVENT_SESSION_START: The session just started. Proactively greet ${userDisplayName()} out loud right now in a warm, concise way (1-2 sentences). ` +
      `Say something like: Hi ${userDisplayName()}, welcome back. ${hermesLine} Then ask what they have in mind. ` +
      "Speak this greeting immediately without waiting for the user to talk first.";

    liveSession.sendRealtimeInput({ text: greeting });
  })();
}

async function startLive() {
  if (liveSession) return liveStatus;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    emitEvent({ type: "fatal", message: "GEMINI_API_KEY is not set." });
    throw new Error("GEMINI_API_KEY is not set");
  }
  stopWakeListener({ reason: "voice_active" });

  const model = process.env.GEMINI_LIVE_MODEL || "models/gemini-3.1-flash-live-preview";
  ai = new GoogleGenAI({ apiKey });
  emitEvent({ type: "sidecar_status", status: { running: true, model, mode: "webrtc-aec" } });
  emitEvent({ type: "voice_status", status: "connecting", model });

  liveSession = await ai.live.connect({
    model,
    config: buildLiveConfig(),
    callbacks: {
      onopen() {
        liveStatus = { running: true, pid: process.pid };
        emitEvent({ type: "sidecar_status", status: { running: true, pid: process.pid, model, mode: "webrtc-aec" } });
        emitEvent({ type: "voice_status", status: "connected", model });
        emitEvent({ type: "audio_state", state: "listening" });
        while (pendingHermesAnnouncements.length > 0 && liveSession) {
          liveSession.sendRealtimeInput({ text: pendingHermesAnnouncements.shift() });
        }
        sendWelcomeGreeting();
      },
      onmessage(message) {
        handleLiveMessage(message);
      },
      onerror(error) {
        emitEvent({ type: "fatal", message: "Voice connection error", error: safeErrorMessage(error) });
      },
      onclose(event) {
        flushTranscripts();
        liveSession = null;
        liveStatus = { running: false, pid: null };
        emitEvent({ type: "voice_status", status: "offline" });
        emitEvent({ type: "audio_state", state: "idle" });
        emitEvent({ type: "sidecar_status", status: liveStatus, reason: event?.reason || "closed" });
        restartWakeListenerSoon();
      },
    },
  });

  return { running: true, pid: process.pid };
}

async function handleToolCall(toolCall) {
  const functionResponses = [];
  for (const call of toolCall.functionCalls || []) {
    emitEvent({ type: "tool_call", name: call.name, args: call.args || {} });
    try {
      const result = await executeHermesTool(call.name, call.args || {});
      functionResponses.push({ id: call.id, name: call.name, response: { result } });
    } catch (error) {
      functionResponses.push({
        id: call.id,
        name: call.name,
        response: { status: "error", error: error.message },
      });
    }
  }
  if (functionResponses.length && liveSession) {
    liveSession.sendToolResponse({ functionResponses });
  }
}

function handleLiveMessage(message) {
  if (message.toolCall) {
    handleToolCall(message.toolCall).catch((error) => {
      emitEvent({ type: "fatal", message: "Tool call failed", error: error.message });
    });
  }

  const content = message.serverContent;
  if (!content) return;

  if (content.interrupted) {
    flushTranscripts();
    emitToRenderer("live:interrupt", {});
    emitEvent({ type: "audio_state", state: "listening" });
    return;
  }

  if (content.inputTranscription?.text) userTranscriptBuffer += content.inputTranscription.text;
  if (content.outputTranscription?.text) modelTranscriptBuffer += content.outputTranscription.text;

  for (const part of content.modelTurn?.parts || []) {
    if (part.text) modelTranscriptBuffer += part.text;
    const inlineData = part.inlineData;
    if (!inlineData?.data) continue;
    const mimeType = inlineData.mimeType || "audio/pcm;rate=24000";
    if (!mimeType.startsWith("audio/")) continue;
    emitToRenderer("live:audio", { data: inlineData.data, mimeType });
    emitEvent({ type: "audio_state", state: "speaking" });
  }

  if (content.turnComplete) {
    flushTranscripts();
    emitEvent({ type: "audio_state", state: "listening" });
  }
}

async function stopLive() {
  if (liveSession) {
    try { liveSession.close(); } catch { /* ignore close races */ }
  }
  liveSession = null;
  liveStatus = { running: false, pid: null };
  emitToRenderer("live:interrupt", {});
  emitEvent({ type: "voice_status", status: "offline" });
  emitEvent({ type: "audio_state", state: "idle" });
  emitEvent({ type: "sidecar_status", status: liveStatus });
  restartWakeListenerSoon();
  return liveStatus;
}

function sendAudioChunk(arrayBuffer) {
  if (!liveSession || !arrayBuffer) return;
  const buffer = Buffer.from(new Uint8Array(arrayBuffer));
  if (!buffer.byteLength) return;
  liveSession.sendRealtimeInput({
    audio: { data: buffer.toString("base64"), mimeType: "audio/pcm;rate=16000" },
  });
}

function sendCommand(command) {
  if (command?.type === "text" && command.text) {
    if (!liveSession) throw new Error("Gemini Live is not running");
    liveSession.sendRealtimeInput({ text: command.text });
  }
  if (command?.type === "submit_hermes_task" && command.task) {
    submitHermesTask({ task: command.task, session_id: command.session_id || "jarvis-voice" }).catch((error) => {
      emitEvent({ type: "hermes_task_update", status: "error", task: command.task, error: error.message });
    });
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 860,
    minWidth: 980,
    minHeight: 800,
    backgroundColor: "#050712",
    ...(appIcon ? { icon: appIcon } : {}),
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 14, y: 14 },
    vibrancy: "under-window",
    webPreferences: {
      preload: path.join(repoRoot, "electron", "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  const devUrl = process.env.VITE_DEV_SERVER_URL ?? "http://127.0.0.1:5173";
  const useProd = app.isPackaged || process.env.JARVIS_START_PROD === "1";
  if (useProd) mainWindow.loadFile(path.join(repoRoot, "dist", "index.html"));
  else mainWindow.loadURL(devUrl);

  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown" || input.isAutoRepeat) return;
    if (input.meta || input.control || input.alt) return;
    const key = String(input.key || "").toLowerCase();
    const code = String(input.code || "").toLowerCase();
    const shortcut = key || (code === "keyw" ? "w" : code === "keys" ? "s" : "");
    if (shortcut === "w" || shortcut === "s") {
      event.preventDefault();
      emitToRenderer("ui:wake-shortcut", { action: shortcut === "w" ? "wake" : "stop" });
    }
  });
}

function installAppMenu() {
  if (process.platform !== "darwin") return;
  app.setAboutPanelOptions({
    applicationName: "J.A.R.V.I.S.",
    applicationVersion: app.getVersion(),
    ...(appIcon ? { iconPath } : {}),
  });
  const menu = Menu.buildFromTemplate([
    {
      label: "J.A.R.V.I.S.",
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    { role: "editMenu" },
    { role: "windowMenu" },
  ]);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  if (appIcon && process.platform === "darwin" && app.dock) {
    app.dock.setIcon(appIcon);
  }
  installAppMenu();

  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(permission === "media" || permission === "audioCapture" || permission === "videoCapture");
  });

  ipcMain.handle("sidecar:start", () => startLive());
  ipcMain.handle("sidecar:stop", () => stopLive());
  ipcMain.handle("sidecar:status", () => liveStatus);
  ipcMain.handle("sidecar:command", (_event, command) => sendCommand(command));
  ipcMain.handle("wake:status", () => wakeState);
  ipcMain.handle("wake:start", () => startWakeListener());
  ipcMain.handle("wake:stop", () => stopWakeListener({ reason: "manual" }));
  ipcMain.handle("wake:audio-status", (_event, status) => updateWakeAudioStatus(status));
  ipcMain.on("wake:audio", (_event, chunk) => sendWakeAudioChunk(chunk));
  ipcMain.on("live:audio", (_event, chunk) => sendAudioChunk(chunk));
  createWindow();
  startWakeListener().catch((error) => {
    updateWakeState({ running: false, configured: Boolean(wakeConfig().script), error: safeErrorMessage(error), reason: "error" });
  });
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("before-quit", () => {
  isQuitting = true;
  stopWakeListener({ reason: "quit", emit: false });
  stopLive();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
