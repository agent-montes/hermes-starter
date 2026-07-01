/// <reference types="vite/client" />

type SidecarMode = "none" | "camera" | "screen";

type SidecarEvent = {
  type: string;
  timestamp?: number;
  [key: string]: unknown;
};

type LiveAudioChunk = {
  data: string;
  mimeType?: string;
};

type WakeStatus = {
  running: boolean;
  configured: boolean;
  engine?: string;
  keyword?: string;
  threshold?: number;
  error?: string | null;
  reason?: string;
};

type WakeAudioStatus = {
  status: "listening" | "error";
  error?: string;
  audioContextState?: string;
};

type JarvisApi = {
  startSidecar: (options?: { mode?: SidecarMode }) => Promise<{ running: boolean; pid: number | null }>;
  stopSidecar: () => Promise<{ running: boolean; pid: number | null }>;
  getSidecarStatus: () => Promise<{ running: boolean; pid: number | null }>;
  getWakeStatus: () => Promise<WakeStatus>;
  startWakeListener: () => Promise<WakeStatus>;
  stopWakeListener: () => Promise<WakeStatus>;
  sendWakeAudioChunk: (chunk: ArrayBuffer) => void;
  reportWakeAudioStatus: (status: WakeAudioStatus) => Promise<WakeStatus>;
  sendCommand: (command: Record<string, unknown>) => Promise<void>;
  sendAudioChunk: (chunk: ArrayBuffer) => void;
  onAudioChunk: (callback: (chunk: LiveAudioChunk) => void) => () => void;
  onAudioInterrupt: (callback: () => void) => () => void;
  onSidecarEvent: (callback: (event: SidecarEvent) => void) => () => void;
  onWakeShortcut: (callback: (event: { action: "wake" | "stop"; source?: string; keyword?: string }) => void) => () => void;
};

interface Window {
  jarvis: JarvisApi;
}
