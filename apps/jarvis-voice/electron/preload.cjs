const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("jarvis", {
  startSidecar: (options) => ipcRenderer.invoke("sidecar:start", options),
  stopSidecar: () => ipcRenderer.invoke("sidecar:stop"),
  getSidecarStatus: () => ipcRenderer.invoke("sidecar:status"),
  getWakeStatus: () => ipcRenderer.invoke("wake:status"),
  startWakeListener: () => ipcRenderer.invoke("wake:start"),
  stopWakeListener: () => ipcRenderer.invoke("wake:stop"),
  sendWakeAudioChunk: (chunk) => ipcRenderer.send("wake:audio", chunk),
  reportWakeAudioStatus: (status) => ipcRenderer.invoke("wake:audio-status", status),
  sendCommand: (command) => ipcRenderer.invoke("sidecar:command", command),
  sendAudioChunk: (chunk) => ipcRenderer.send("live:audio", chunk),
  onAudioChunk: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on("live:audio", handler);
    return () => ipcRenderer.removeListener("live:audio", handler);
  },
  onAudioInterrupt: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on("live:interrupt", handler);
    return () => ipcRenderer.removeListener("live:interrupt", handler);
  },
  onSidecarEvent: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on("sidecar:event", handler);
    return () => ipcRenderer.removeListener("sidecar:event", handler);
  },
  onWakeShortcut: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on("ui:wake-shortcut", handler);
    return () => ipcRenderer.removeListener("ui:wake-shortcut", handler);
  },
});
