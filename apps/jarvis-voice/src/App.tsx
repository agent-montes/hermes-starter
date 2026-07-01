import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  Camera,
  ChevronRight,
  Hand,
  History,
  MessageSquare,
  Mic,
  MicOff,
  Power,
  Radio,
  Terminal,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ReactorCore from "./ReactorCore";
import BootSequence from "./BootSequence";
import { useHandControl, type HandState } from "./useHandControl";

type ReactorState = "idle" | "online" | "listening" | "speaking" | "working";

type TaskCard = {
  id: string;
  task: string;
  status: string;
  output?: string;
  error?: string;
  updatedAt: number;
};

type LogLine = {
  id: string;
  level: string;
  message: string;
  timestamp: number;
};

type TranscriptLine = {
  id: string;
  speaker: string;
  text: string;
};

const MAX_LOGS = 80;
const TERMINAL = new Set(["completed", "failed", "cancelled", "canceled", "error"]);

// Arc-reactor accent color per state (matches ReactorCore palettes) — drives the
// surrounding ring/radar so it stays the same color as the orb.
const ORB_ACCENT: Record<ReactorState, string> = {
  idle: "105, 150, 210",
  online: "42, 125, 255",
  listening: "80, 170, 255",
  speaking: "238, 122, 92",
  working: "90, 145, 255",
};

function eventTime(event: SidecarEvent): number {
  return typeof event.timestamp === "number" ? event.timestamp * 1000 : Date.now();
}

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function readStatusObject(value: unknown): {
  running?: boolean;
  pid?: number | null;
  model?: string;
  mode?: string;
} {
  if (!value || typeof value !== "object") return {};
  return value as { running?: boolean; pid?: number | null; model?: string; mode?: string };
}

function taskKeyFor(task: string): string {
  return `starting:${task.toLowerCase().trim()}`;
}

function shortRunId(id: string): string {
  if (!id || id === "pending") return "pending";
  if (id.startsWith("starting:")) return "starting";
  if (id.length <= 14) return id;
  return `${id.slice(0, 7)}…${id.slice(-5)}`;
}

function downsampleTo16k(input: Float32Array, inputRate: number): Int16Array {
  const outputRate = 16000;
  if (inputRate === outputRate) {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const sample = Math.max(-1, Math.min(1, input[i]));
      output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
    return output;
  }

  const ratio = inputRate / outputRate;
  const outputLength = Math.floor(input.length / ratio);
  const output = new Int16Array(outputLength);
  for (let i = 0; i < outputLength; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(Math.floor((i + 1) * ratio), input.length);
    let sum = 0;
    for (let j = start; j < end; j++) sum += input[j];
    const sample = Math.max(-1, Math.min(1, sum / Math.max(1, end - start)));
    output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return output;
}

function parsePcmRate(mimeType?: string): number {
  const match = /rate=(\d+)/i.exec(mimeType ?? "");
  return match ? Number(match[1]) : 24000;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function normalizeMarkdown(text?: string): string {
  if (!text) return "";
  return text
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "  ");
}

export default function App() {
  const [sidecarRunning, setSidecarRunning] = useState(false);
  const [sidecarPid, setSidecarPid] = useState<number | null>(null);
  const [voiceStatus, setVoiceStatus] = useState("offline");
  const [hermesStatus, setHermesStatus] = useState("offline");
  const [audioState, setAudioState] = useState("idle");
  const [wakeStatus, setWakeStatus] = useState<WakeStatus>({ running: false, configured: false });
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [tasks, setTasks] = useState<TaskCard[]>([]);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [muted, setMuted] = useState(false);
  const [handControl, setHandControl] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const hasBridge = typeof window.jarvis !== "undefined";
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const inputStreamRef = useRef<MediaStream | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const inputProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const wakeContextRef = useRef<AudioContext | null>(null);
  const wakeStreamRef = useRef<MediaStream | null>(null);
  const wakeSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const wakeProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const wakeCaptureStartingRef = useRef(false);
  const outputContextRef = useRef<AudioContext | null>(null);
  const playbackTimeRef = useRef(0);
  const playbackSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioLevelRef = useRef(0);
  const sessionStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!hasBridge) return;
    window.jarvis.getSidecarStatus().then((status) => {
      setSidecarRunning(status.running);
      setSidecarPid(status.pid);
    });
    window.jarvis.getWakeStatus?.().then((status) => setWakeStatus(status)).catch(() => undefined);
    return window.jarvis.onSidecarEvent((event) => handleSidecarEvent(event));
  }, [hasBridge]);

  useEffect(() => {
    if (!hasBridge) return;
    const offAudio = window.jarvis.onAudioChunk((chunk) => playVoiceAudio(chunk));
    const offInterrupt = window.jarvis.onAudioInterrupt(() => flushPlayback());
    return () => {
      offAudio();
      offInterrupt();
    };
  }, [hasBridge]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      const key = event.key.toLowerCase();
      if (key === "w" && !sidecarRunning) {
        event.preventDefault();
        void start();
      } else if (key === "s" && sidecarRunning) {
        event.preventDefault();
        void stop();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidecarRunning, hasBridge]);

  useEffect(() => {
    if (!hasBridge) return;
    return window.jarvis.onWakeShortcut((event) => {
      if (event.action === "wake" && !sidecarRunning) void start();
      if (event.action === "stop" && sidecarRunning) void stop();
    });
  }, [sidecarRunning, hasBridge]);

  useEffect(() => {
    if (!hasBridge) return;
    if (wakeStatus.running && !sidecarRunning) {
      void startWakeAudioCapture();
    } else {
      void stopWakeAudioCapture();
    }
  }, [hasBridge, wakeStatus.running, sidecarRunning]);

  useEffect(() => {
    return () => {
      void stopWakeAudioCapture();
    };
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Passive audio level meter (mic in / voice out) for the reactive HUD.
  useEffect(() => {
    let raf = 0;
    const buf = new Uint8Array(256);
    const rms = (analyser: AnalyserNode | null) => {
      if (!analyser) return 0;
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      return Math.sqrt(sum / buf.length);
    };
    const tick = () => {
      const level = Math.max(rms(inputAnalyserRef.current), rms(outputAnalyserRef.current));
      const boosted = Math.min(1, level * 2.6);
      audioLevelRef.current += (boosted - audioLevelRef.current) * 0.4;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const working = useMemo(
    () => tasks.some((task) => !TERMINAL.has(task.status.toLowerCase())) && tasks.length > 0,
    [tasks],
  );

  const booting = sidecarRunning && voiceStatus !== "connected";

  const reactorState: ReactorState = useMemo(() => {
    if (!sidecarRunning) return "idle";
    if (audioState === "speaking") return "speaking";
    if (audioState === "listening") return "listening";
    if (working) return "working";
    if (voiceStatus === "connected") return "online";
    return "idle";
  }, [audioState, voiceStatus, sidecarRunning, working]);

  function pushLog(level: string, message: string, timestamp = Date.now()) {
    setLogs((current) =>
      [{ id: crypto.randomUUID(), level, message, timestamp }, ...current].slice(0, MAX_LOGS),
    );
  }

  function pcmToArrayBuffer(pcm: Int16Array): ArrayBuffer {
    const chunk = new ArrayBuffer(pcm.byteLength);
    new Uint8Array(chunk).set(new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength));
    return chunk;
  }

  async function startWakeAudioCapture() {
    if (!hasBridge || wakeContextRef.current || wakeCaptureStartingRef.current) return;
    wakeCaptureStartingRef.current = true;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
      if (devices.length > 0 && !devices.some((device) => device.kind === "audioinput")) {
        throw new Error("No microphone input device found");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
          channelCount: 1,
        },
        video: false,
      });

      const context = new AudioContext();
      await context.resume().catch(() => undefined);
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(2048, 1, 1);
      processor.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0);
        const output = event.outputBuffer.getChannelData(0);
        output.fill(0);
        const pcm = downsampleTo16k(input, context.sampleRate);
        if (pcm.byteLength > 0) window.jarvis.sendWakeAudioChunk(pcmToArrayBuffer(pcm));
      };

      source.connect(processor);
      processor.connect(context.destination);
      wakeContextRef.current = context;
      wakeStreamRef.current = stream;
      wakeSourceRef.current = source;
      wakeProcessorRef.current = processor;
      await window.jarvis.reportWakeAudioStatus({ status: "listening", audioContextState: context.state }).catch(() => undefined);
      pushLog("info", `Local openWakeWord microphone listener is active (${context.state}).`);
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : String(error);
      const message = /not\s*found|requested device|no microphone/i.test(rawMessage)
        ? "Wake word is ready, but no microphone input device was found. Connect a USB/Bluetooth mic or use the phone bridge."
        : /denied|permission/i.test(rawMessage)
          ? "Wake word is ready, but microphone permission was denied. Enable microphone access for J.A.R.V.I.S. in macOS Privacy settings."
          : `Wake microphone capture failed: ${rawMessage}`;
      await window.jarvis.reportWakeAudioStatus({ status: "error", error: message }).catch(() => undefined);
      pushLog("error", message);
    } finally {
      wakeCaptureStartingRef.current = false;
    }
  }

  async function stopWakeAudioCapture() {
    wakeProcessorRef.current?.disconnect();
    wakeSourceRef.current?.disconnect();
    wakeStreamRef.current?.getTracks().forEach((track) => track.stop());
    await wakeContextRef.current?.close().catch(() => undefined);
    wakeProcessorRef.current = null;
    wakeSourceRef.current = null;
    wakeStreamRef.current = null;
    wakeContextRef.current = null;
  }

  async function startAudioCapture() {
    if (!hasBridge || inputContextRef.current) return;

    const devices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
    if (devices.length > 0 && !devices.some((device) => device.kind === "audioinput")) {
      throw new Error("No microphone input device found");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      },
      video: false,
    });

    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const processor = context.createScriptProcessor(1024, 1, 1);

    // Passive meter tap for the reactive HUD (does not affect what is sent).
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    inputAnalyserRef.current = analyser;

    processor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      const output = event.outputBuffer.getChannelData(0);
      output.fill(0);

      const pcm = downsampleTo16k(input, context.sampleRate);
      if (pcm.byteLength > 0) {
        window.jarvis.sendAudioChunk(pcmToArrayBuffer(pcm));
      }
    };

    source.connect(processor);
    processor.connect(context.destination);

    inputContextRef.current = context;
    inputStreamRef.current = stream;
    inputSourceRef.current = source;
    inputProcessorRef.current = processor;
    pushLog("info", "WebRTC echo cancellation enabled for microphone.");
  }

  async function stopAudioCapture() {
    inputProcessorRef.current?.disconnect();
    inputSourceRef.current?.disconnect();
    inputStreamRef.current?.getTracks().forEach((track) => track.stop());
    await inputContextRef.current?.close().catch(() => undefined);

    inputProcessorRef.current = null;
    inputSourceRef.current = null;
    inputStreamRef.current = null;
    inputContextRef.current = null;
    inputAnalyserRef.current = null;
  }

  function flushPlayback() {
    for (const source of playbackSourcesRef.current) {
      try {
        source.stop();
      } catch {
        // Already stopped.
      }
    }
    playbackSourcesRef.current = [];
    if (outputContextRef.current) {
      playbackTimeRef.current = outputContextRef.current.currentTime;
    }
  }

  async function playVoiceAudio(chunk: LiveAudioChunk) {
    const rate = parsePcmRate(chunk.mimeType);
    const bytes = base64ToBytes(chunk.data);
    const sampleCount = Math.floor(bytes.byteLength / 2);
    if (!sampleCount) return;

    const context = outputContextRef.current ?? new AudioContext();
    outputContextRef.current = context;
    if (context.state === "suspended") await context.resume();

    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const buffer = context.createBuffer(1, sampleCount, rate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      channel[i] = view.getInt16(i * 2, true) / 32768;
    }

    let analyser = outputAnalyserRef.current;
    if (!analyser || analyser.context !== context) {
      analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyser.connect(context.destination);
      outputAnalyserRef.current = analyser;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(analyser);
    source.onended = () => {
      playbackSourcesRef.current = playbackSourcesRef.current.filter((item) => item !== source);
    };

    const startAt = Math.max(context.currentTime + 0.03, playbackTimeRef.current || 0);
    source.start(startAt);
    playbackTimeRef.current = startAt + buffer.duration;
    playbackSourcesRef.current.push(source);
  }

  function handleSidecarEvent(event: SidecarEvent) {
    if (event.type === "sidecar_status") {
      const status = readStatusObject(event.status);
      setSidecarRunning(Boolean(status.running));
      setSidecarPid(typeof status.pid === "number" ? status.pid : null);
      return;
    }

    if (event.type === "voice_status") {
      setVoiceStatus(readString(event.status, "unknown"));
      return;
    }

    if (event.type === "wake_status") {
      const status = readStatusObject(event.status) as WakeStatus;
      setWakeStatus(status);
      if (status.error) {
        pushLog("error", `Wake word: ${status.error}`, eventTime(event));
      } else if (status.running) {
        pushLog("info", `Wake word listening for ${status.keyword || "jarvis"}.`, eventTime(event));
      }
      return;
    }

    if (event.type === "wake_detected") {
      pushLog("info", `Wake word heard: ${readString(event.keyword, "jarvis")}.`, eventTime(event));
      return;
    }

    if (event.type === "hermes_status") {
      const status = readString(event.status, "unknown");
      setHermesStatus(status);
      pushLog(
        status === "error" ? "error" : "info",
        `Hermes ${status}${event.error ? `: ${readString(event.error)}` : ""}`,
        eventTime(event),
      );
      return;
    }

    if (event.type === "audio_state") {
      setAudioState(readString(event.state, "idle"));
      return;
    }

    if (event.type === "transcript") {
      const speaker = readString(event.speaker, "unknown");
      const text = readString(event.text);
      if (text.trim()) {
        setTranscript((current) =>
          [...current, { id: crypto.randomUUID(), speaker, text }].slice(-40),
        );
      }
      return;
    }

    if (event.type === "hermes_task_update") {
      const task = readString(event.task, "Hermes task");
      const rawRunId = readString(event.run_id);
      const runId = rawRunId || taskKeyFor(task);
      const status = readString(event.status, "unknown");
      const output = readString(event.output);
      const error = readString(event.error);

      setTasks((current) => {
        const existing = current.find((item) => item.id === runId);
        const placeholderId = taskKeyFor(task);
        const next: TaskCard = {
          id: runId,
          task,
          status,
          output: output || existing?.output,
          error: error || existing?.error,
          updatedAt: eventTime(event),
        };
        return [
          next,
          ...current.filter((item) => item.id !== runId && item.id !== placeholderId),
        ].slice(0, 20);
      });
      return;
    }

    if (event.type === "hermes_completion") {
      pushLog("info", `Hermes returned: ${readString(event.task, "task complete")}`, eventTime(event));
      return;
    }

    if (event.type === "tool_call") {
      pushLog("info", `Voice invoked ${readString(event.name, "tool")}`, eventTime(event));
      return;
    }

    if (event.type === "fatal") {
      const message = readString(event.message, "Fatal sidecar error");
      const detail = readString(event.error);
      pushLog("error", detail ? `${message}: ${detail}` : message, eventTime(event));
      return;
    }

    if (event.type === "log") {
      pushLog(readString(event.level, "info"), readString(event.message), eventTime(event));
    }
  }

  async function start() {
    if (!hasBridge) {
      pushLog("error", "Local bridge unavailable. Launch with `npm run dev`.");
      return;
    }
    pushLog("info", "Wake shortcut received. Connecting voice…");
    await stopWakeAudioCapture();
    setVoiceStatus("connecting");
    try {
      const status = await window.jarvis.startSidecar({ mode: "none" });
      setSidecarRunning(status.running);
      setSidecarPid(status.pid);
      sessionStartRef.current = Date.now();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setSidecarRunning(false);
      setVoiceStatus("error");
      pushLog("error", `Wake failed: ${message}`);
      if (wakeStatus.running) void startWakeAudioCapture();
      return;
    }

    try {
      await startAudioCapture();
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : String(error);
      const message = /not\s*found|requested device|no microphone/i.test(rawMessage)
        ? "Voice is online, but no microphone input device was found. Connect a USB/Bluetooth mic or use the phone bridge for mic input."
        : /denied|permission/i.test(rawMessage)
          ? "Voice is online, but microphone permission was denied. Enable microphone access for J.A.R.V.I.S. in macOS Privacy settings."
          : `Voice is online, but microphone capture failed: ${rawMessage}`;
      setAudioState("input_error");
      pushLog("error", message);
    }
    setHandControl(true);
  }

  async function stop() {
    if (!hasBridge) return;
    await stopAudioCapture();
    flushPlayback();
    await window.jarvis.stopSidecar();
    setVoiceStatus("offline");
    setHermesStatus("offline");
    setAudioState("idle");
    setMuted(false);
    setHandControl(false);
    sessionStartRef.current = null;
  }

  function dotState(value: string, goodValues: string[]) {
    if (!sidecarRunning) return "off";
    if (value === "error") return "err";
    return goodValues.includes(value) ? "on" : "warn";
  }

  const expandedTask = useMemo(
    () => tasks.find((task) => task.id === expandedTaskId) ?? null,
    [tasks, expandedTaskId],
  );
  const dwellRef = useRef<{ id: string; startedAt: number } | null>(null);

  const { state: hand, error: handError, stream: handStream } = useHandControl(handControl);
  const handCamRef = useRef<HTMLVideoElement | null>(null);
  const workScrollRef = useRef<HTMLDivElement | null>(null);
  const commsScrollRef = useRef<HTMLDivElement | null>(null);
  const liveHandRef = useRef<HandState | null>(hand);
  liveHandRef.current = hand;

  useEffect(() => {
    if (handError) pushLog("error", `Hand control: ${handError}`);
  }, [handError]);

  useEffect(() => {
    if (handCamRef.current) {
      handCamRef.current.srcObject = handStream;
    }
  }, [handStream]);

  useEffect(() => {
    if (!handControl || !hand.present || !hand.point || !hand.pointing || expandedTaskId) {
      dwellRef.current = null;
      return;
    }

    const el = document.elementFromPoint(hand.point.x, hand.point.y);
    const card = el?.closest<HTMLElement>("[data-task-id]");
    const taskId = card?.dataset.taskId;
    if (!taskId || !card) {
      dwellRef.current = null;
      return;
    }

    const now = performance.now();
    if (dwellRef.current?.id !== taskId) {
      dwellRef.current = { id: taskId, startedAt: now };
      return;
    }

    if (now - dwellRef.current.startedAt > 300) {
      const task = tasks.find((item) => item.id === taskId);
      if (task) openTask(task);
      dwellRef.current = null;
    }
  }, [handControl, hand.present, hand.point?.x, hand.point?.y, expandedTaskId, tasks]);

  // Open-palm hold-to-scroll for whichever scrollable section the hand is over
  // (Comms or Work Stream): hold the hand high to scroll up, low to scroll down.
  useEffect(() => {
    let raf = 0;
    const isInside = (el: HTMLElement | null, x: number, y: number) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };
    const loop = () => {
      const h = liveHandRef.current;
      if (handControl && h?.openPalm && h.point && !expandedTaskId && !showHistory) {
        const { x, y } = h.point;
        const body =
          [commsScrollRef.current, workScrollRef.current].find((el) => isInside(el, x, y)) ?? null;
        if (body) {
          const rect = body.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const deadZone = Math.max(40, rect.height * 0.12);
          const delta = y - center;
          if (Math.abs(delta) > deadZone) {
            const reach = rect.height / 2 - deadZone;
            const norm = Math.max(-1, Math.min(1, (delta - Math.sign(delta) * deadZone) / reach));
            body.scrollTop += norm * 26;
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [handControl, expandedTaskId, showHistory]);

  const handAction = useMemo(() => {
    if (!hand.present) return { label: "Show your hand", tone: "idle" };
    if (hand.fist) return { label: "Closed_Fist · close", tone: "fist" };
    if (hand.openPalm) return { label: "Open_Palm · scroll", tone: "open" };
    if (!hand.pointing) return { label: `${hand.gesture} · idle`, tone: "idle" };
    if (dwellRef.current) return { label: "Hold · opening", tone: "move" };
    return { label: "Pointing_Up · hover", tone: "move" };
  }, [hand.present, hand.fist, hand.openPalm, hand.pointing, hand.gesture, hand.point?.x, hand.point?.y]);

  function toggleMute() {
    const stream = inputStreamRef.current;
    const next = !muted;
    stream?.getAudioTracks().forEach((track) => (track.enabled = !next));
    setMuted(next);
  }

  const sortedTasks = useMemo(() => {
    const isActive = (task: TaskCard) => !TERMINAL.has(task.status.toLowerCase());
    return [...tasks].sort((a, b) => {
      const activeDelta = Number(isActive(b)) - Number(isActive(a));
      if (activeDelta !== 0) return activeDelta;
      return b.updatedAt - a.updatedAt;
    });
  }, [tasks]);


  const caption = useMemo(() => {
    if (!sidecarRunning) {
      if (wakeStatus.error) return { text: "Wake word needs a microphone. Press W as backup.", dim: true };
      if (wakeStatus.running) return { text: "Say “Hey Jarvis” or press W to wake J.A.R.V.I.S.", dim: true };
      return { text: "Press W to wake J.A.R.V.I.S.", dim: true };
    }
    if (audioState === "speaking") return { text: "Speaking…", dim: false };
    if (audioState === "listening") return { text: "Listening…", dim: false };
    if (audioState === "input_error") return { text: "Voice online · connect a microphone to talk.", dim: true };
    if (working) return { text: "Working on it…", dim: false };
    const last = transcript[transcript.length - 1];
    if (last) return { text: last.text, dim: false };
    if (voiceStatus === "connected") return { text: "How can I help?", dim: true };
    return { text: "Connecting…", dim: true };
  }, [sidecarRunning, audioState, working, transcript, voiceStatus, wakeStatus.running, wakeStatus.error]);

  const latestLog = logs[0];
  const wakeDot = wakeStatus.error ? "err" : wakeStatus.running ? "on" : wakeStatus.configured ? "warn" : "off";

  function openTask(task: TaskCard) {
    if (!(task.output || task.error)) return;
    setExpandedTaskId(task.id);
    setShowHistory(false);
  }

  function closeReader() {
    setExpandedTaskId(null);
  }

  return (
    <>
    <div className={`deck ${sidecarRunning ? "awake" : "asleep"}`}>
      <div className="hud-aurora" />
      <div className="hud-vignette" />
      <div className="hud-scanlines" />

      <header className="deck-top">
        <div className="deck-top-left">
          <div className="deck-status">
            <StatusDot tone="wake" state={wakeDot} label="Wake" />
            <StatusDot tone="voice" state={dotState(voiceStatus, ["connected"])} label="Voice" />
            <StatusDot tone="hermes" state={dotState(hermesStatus, ["ready"])} label="Hermes" />
            <StatusDot
              tone="audio"
              state={
                !sidecarRunning
                  ? "off"
                  : muted
                    ? "warn"
                    : audioState === "speaking"
                      ? "speaking"
                      : audioState === "input_error"
                        ? "warn"
                        : audioState === "idle"
                          ? "warn"
                          : "on"
              }
              label="Audio"
            />
          </div>
        </div>
        <div className="deck-brand">
          <span className="brand-mark">J.A.R.V.I.S.</span>
        </div>
        <div className="deck-top-right">
          <button
            className={`theme-toggle ${handControl ? "active" : ""}`}
            onClick={() => setHandControl((current) => !current)}
            title={handControl ? "Disable hand control" : "Enable hand control (camera)"}
          >
            <Hand size={16} />
          </button>
          <span
            className={`link-indicator ${sidecarRunning ? "on" : "off"}`}
            title={sidecarRunning ? `Linked${sidecarPid ? ` · ${sidecarPid}` : ""}` : "Offline"}
          >
            <Radio size={16} />
          </span>
        </div>
      </header>

      <div className={`deck-body ${leftCollapsed ? "left-collapsed" : ""} ${rightCollapsed ? "right-collapsed" : ""}`}>
        {leftCollapsed ? (
          <button
            className="side-edge left-edge"
            onClick={() => setLeftCollapsed(false)}
            title="Open comms and camera"
            type="button"
          >
            <span>Comms / Camera</span>
            <i>›</i>
          </button>
        ) : (
          <div className="deck-left">
            <section className="deck-panel comms">
              <div className="col-head">
                <MessageSquare size={14} />
                <span>Comms</span>
                <button
                  className="side-collapse side-collapse-left"
                  onClick={() => setLeftCollapsed(true)}
                  title="Hide comms and camera"
                  type="button"
                >
                  ‹
                </button>
              </div>
              <div className="comms-scroll" ref={commsScrollRef}>
                {transcript.length === 0 ? (
                  <p className="empty">No conversation yet. Wake J.A.R.V.I.S. and start talking.</p>
                ) : (
                  transcript.map((line) => {
                    const self = /you|user/i.test(line.speaker);
                    return (
                      <div className={`bubble ${self ? "self" : "assistant"}`} key={line.id}>
                        <span className="who">{self ? "You" : "J.A.R.V.I.S."}</span>
                        {line.text}
                      </div>
                    );
                  })
                )}
                <div ref={transcriptEndRef} />
              </div>
            </section>

            <section className="deck-panel camera-dock">
              <div className="col-head">
                <Camera size={14} />
                <span>Camera / Gesture</span>
              </div>
              {handControl ? (
                <div className="camera-frame">
                  <video ref={handCamRef} autoPlay playsInline muted />
                  <div className="cam-scan" />
                  <span className="cam-status">
                    <i />
                    {hand.present ? "tracking" : "no hand"}
                  </span>
                  <span className={`gesture-chip ${handAction.tone}`}>
                    <span className="dot" />
                    {handAction.label}
                  </span>
                </div>
              ) : (
                <div className="camera-off">
                  Gesture control is off. Tap the hand icon to enable the camera.
                </div>
              )}
            </section>
          </div>
        )}

        {/* CENTER — J.A.R.V.I.S. */}
        <div className="deck-center">
          <div
            className="orb-stage"
            style={{ "--orb-accent": ORB_ACCENT[reactorState] } as CSSProperties}
          >
            <span className="orb-ring" />
            <span className="orb-radar" />
            <ReactorCore state={reactorState} levelRef={audioLevelRef} />
          </div>
          <Telemetry
            awake={sidecarRunning}
            voice={voiceStatus}
            hermes={hermesStatus}
            runs={tasks.length}
            sessionStartRef={sessionStartRef}
          />
          <div className={`caption ${caption.dim ? "dim" : ""}`}>
            {caption.text}
            {sidecarRunning ? <span className="caption-caret" /> : null}
          </div>
          {latestLog ? <div className={`mini-log ${latestLog.level}`}>{latestLog.message}</div> : null}
          {sidecarRunning ? (
            <div className="transport">
              <button
                className={`t-btn small ${muted ? "muted" : ""}`}
                onClick={toggleMute}
                title={muted ? "Unmute microphone" : "Mute microphone"}
              >
                {muted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button className="t-btn small danger" onClick={stop} title="Sleep (S)">
                <Power size={18} />
              </button>
            </div>
          ) : (
            <div className="transport-hint">
              <span className="key">W</span> wake · <span className="key">S</span> sleep
            </div>
          )}
        </div>

        {rightCollapsed ? (
          <button
            className="side-edge right-edge"
            onClick={() => setRightCollapsed(false)}
            title="Open work stream"
            type="button"
          >
            <i>‹</i>
            <span>Work Stream</span>
          </button>
        ) : (
          <aside className="deck-panel deck-right">
            <div className="col-head">
              <Terminal size={14} />
              <span>Work Stream</span>
              {tasks.length > 0 ? <span className="count">{tasks.length}</span> : null}
              {tasks.length > 3 ? (
                <button className="view-all" onClick={() => setShowHistory(true)}>
                  View all <ChevronRight size={12} />
                </button>
              ) : null}
              <button
                className="side-collapse side-collapse-right"
                onClick={() => setRightCollapsed(true)}
                title="Hide work stream"
                type="button"
              >
                ›
              </button>
            </div>
            <div className="work-scroll" ref={workScrollRef}>
              {tasks.length === 0 ? (
                <p className="empty">No Hermes runs yet. Ask J.A.R.V.I.S. to take on a task.</p>
              ) : (
                sortedTasks.map((task) => (
                  <WorkCard key={task.id} task={task} onOpen={() => openTask(task)} />
                ))
              )}
            </div>
          </aside>
        )}
      </div>

      {booting && <BootSequence visible={booting} />}
    </div>

    {expandedTask ? (
      <ExpandedReader
        task={expandedTask}
        hand={handControl ? hand : null}
        onClose={closeReader}
      />
    ) : null}

    {showHistory ? (
      <HistoryDrawer
        tasks={sortedTasks}
        onOpen={openTask}
        onClose={() => setShowHistory(false)}
      />
    ) : null}

    {handControl && hand.present && hand.point ? (
      <div
        className={`hand-reticle ${dwellRef.current ? "dwell" : ""} ${hand.pointing ? "pointing" : ""} ${hand.openPalm ? "open" : ""} ${hand.fist ? "fist" : ""}`}
        style={{ transform: `translate(${hand.point.x}px, ${hand.point.y}px)` }}
      >
        <span className="hand-ring" />
        <span className="hand-dot" />
      </div>
    ) : null}
    </>
  );
}

function StatusDot({ tone, state, label }: { tone: string; state: string; label: string }) {
  return (
    <span className={`status-dot ${tone} ${state}`}>
      <i />
      {label}
    </span>
  );
}

function Telemetry({
  awake,
  voice,
  hermes,
  runs,
  sessionStartRef,
}: {
  awake: boolean;
  voice: string;
  hermes: string;
  runs: number;
  sessionStartRef: { current: number | null };
}) {
  const [, force] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => force((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const elapsed = awake && sessionStartRef.current ? Date.now() - sessionStartRef.current : 0;
  const mm = String(Math.floor(elapsed / 60000)).padStart(2, "0");
  const ss = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, "0");

  return (
    <div className={`telemetry ${awake ? "live" : ""}`} aria-hidden="true">
      <span>
        <i>UPLINK</i>
        {voice === "connected" ? "LIVE" : awake ? "SYNC" : "OFFLINE"}
      </span>
      <span className="sep">/</span>
      <span>
        <i>HERMES</i>
        {hermes === "ready" ? "READY" : awake ? "···" : "—"}
      </span>
      <span className="sep">/</span>
      <span>
        <i>RUNS</i>
        {String(runs).padStart(2, "0")}
      </span>
      <span className="sep">/</span>
      <span>
        <i>SESSION</i>
        {mm}:{ss}
      </span>
    </div>
  );
}

function WorkCard({ task, onOpen }: { task: TaskCard; onOpen: () => void }) {
  const expandable = Boolean(task.output || task.error);
  const status = task.status.toLowerCase();
  const active = !TERMINAL.has(status);
  return (
    <article
      className={`wcard ${active ? "working" : ""} ${expandable ? "expandable" : ""}`}
      data-task-id={expandable ? task.id : undefined}
      onClick={onOpen}
    >
      <div className="wcard-top">
        <span className={`badge ${status}`}>{task.status}</span>
        <code title={task.id}>{shortRunId(task.id)}</code>
      </div>
      <p className="wcard-task">{task.task}</p>
      {expandable ? (
        <div className="wcard-preview">{normalizeMarkdown(task.error || task.output)}</div>
      ) : null}
      {active ? (
        <div className="wcard-progress">
          <i />
        </div>
      ) : null}
    </article>
  );
}

function HistoryDrawer({
  tasks,
  onOpen,
  onClose,
}: {
  tasks: TaskCard[];
  onOpen: (task: TaskCard) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="history-backdrop"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="history-card">
        <div className="history-head">
          <History size={15} />
          <span>Hermes History · {tasks.length}</span>
          <button className="reader-close" onClick={onClose} title="Close">
            <X size={16} />
          </button>
        </div>
        <div className="history-grid">
          {tasks.map((task) => (
            <WorkCard key={task.id} task={task} onOpen={() => onOpen(task)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ExpandedReader({
  task,
  hand,
  onClose,
}: {
  task: TaskCard;
  hand: HandState | null;
  onClose: () => void;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [closing, setClosing] = useState(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const handRef = useRef<HandState | null>(hand);
  handRef.current = hand;

  const CLOSE_DISTANCE = 160;

  function closeWithSnap() {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, 180);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeWithSnap();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closing, onClose]);

  useEffect(() => {
    if (hand?.fist) closeWithSnap();
  }, [hand?.fist]);

  // Joystick-style hold-to-scroll: with an open palm, holding the hand above the
  // card's center scrolls up, below scrolls down, and the middle is a dead zone.
  // Speed is proportional to the distance from center and continues while held.
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const h = handRef.current;
      const body = bodyRef.current;
      if (h?.openPalm && h.point && body) {
        const rect = body.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const deadZone = Math.max(40, rect.height * 0.12);
        const delta = h.point.y - center;
        if (Math.abs(delta) > deadZone) {
          const reach = rect.height / 2 - deadZone;
          const norm = Math.max(-1, Math.min(1, (delta - Math.sign(delta) * deadZone) / reach));
          body.scrollTop += norm * 26;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  function beginDrag(clientX: number, clientY: number, target: HTMLElement, pointerId: number) {
    startRef.current = { x: clientX, y: clientY };
    setDragging(true);
    try {
      target.setPointerCapture?.(pointerId);
    } catch {
      // Pointer capture is best-effort; dragging still works without it.
    }
  }

  function moveDrag(clientX: number, clientY: number) {
    if (!startRef.current) return;
    setOffset({ x: clientX - startRef.current.x, y: clientY - startRef.current.y });
  }

  function endDrag() {
    if (!startRef.current) return;
    const distance = Math.hypot(offset.x, offset.y);
    startRef.current = null;
    setDragging(false);
    if (distance > CLOSE_DISTANCE) {
      closeWithSnap();
    } else {
      setOffset({ x: 0, y: 0 });
    }
  }

  const dim = Math.min(1, Math.hypot(offset.x, offset.y) / (CLOSE_DISTANCE * 2));

  return (
    <div
      className={`reader-backdrop ${closing ? "closing" : ""}`}
      style={{ opacity: 1 - dim * 0.6 }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) closeWithSnap();
      }}
    >
      <article
        className={`reader-card ${dragging ? "dragging" : ""} ${closing ? "closing" : ""}`}
        style={{
          "--reader-transform": `translate(${offset.x}px, ${offset.y}px) scale(${1 - dim * 0.08})`,
        } as CSSProperties}
      >
        <header
          className="reader-grab"
          onPointerDown={(event) =>
            beginDrag(event.clientX, event.clientY, event.currentTarget, event.pointerId)
          }
          onPointerMove={(event) => dragging && moveDrag(event.clientX, event.clientY)}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div className="reader-grip" />
          <span className={`badge ${task.status.toLowerCase()}`}>{task.status}</span>
          <code title={task.id}>{shortRunId(task.id)}</code>
          <button
            className="reader-close"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={closeWithSnap}
            title="Close"
          >
            <X size={16} />
          </button>
        </header>
        <h2 className="reader-title">{task.task}</h2>
        <div className="reader-body" ref={bodyRef}>
          <div className={`markdown-body ${task.error ? "error" : ""}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {normalizeMarkdown(task.error || task.output)}
            </ReactMarkdown>
          </div>
        </div>
        <div className="reader-hint">
          {hand
            ? "Open palm — hold high to scroll up, low to scroll down · Fist to close"
            : "Scroll to read · Esc or × to close"}
        </div>
      </article>
    </div>
  );
}
