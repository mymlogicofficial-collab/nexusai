/**
 * S.A.I.D. Local Chat Bridge
 * Connects to a local WebSocket chat engine.
 *
 * Expected protocol:
 *   SEND:    { type: "message", role: "user", content: "...", history: [...] }
 *   RECEIVE: { type: "message", role: "assistant", content: "..." }
 *   RECEIVE: { type: "token", content: "..." }   // streaming token
 *   RECEIVE: { type: "done" }                     // end of stream
 *   RECEIVE: { type: "error", message: "..." }
 *
 * Plain text fallback: raw string responses are treated as assistant messages.
 */

class LocalChatBridge {
  constructor() {
    this.ws = null;
    this.status = "disconnected"; // disconnected | connecting | connected | error
    this.onStatusChange = null;
    this.onMessage = null;
    this.onToken = null;
    this.onDone = null;
    this.onError = null;
    this.reconnectTimer = null;
    this.autoReconnect = false;
    this.port = parseInt(localStorage.getItem("said_local_port") || "8765", 10);
  }

  _setStatus(status) {
    this.status = status;
    this.onStatusChange?.(status);
  }

  connect(port) {
    if (port) {
      this.port = port;
      localStorage.setItem("said_local_port", String(port));
    }
    if (this.ws) { this.ws.close(); this.ws = null; }
    clearTimeout(this.reconnectTimer);
    this._setStatus("connecting");

    this.ws = new WebSocket(`ws://localhost:${this.port}`);

    this.ws.onopen = () => {
      this._setStatus("connected");
      this.autoReconnect = true;
    };

    this.ws.onmessage = (event) => {
      let data;
      try { data = JSON.parse(event.data); } catch {
        this.onMessage?.({ role: "assistant", content: event.data });
        return;
      }
      switch (data.type) {
        case "message": this.onMessage?.(data); break;
        case "token":   this.onToken?.(data.content); break;
        case "done":    this.onDone?.(); break;
        case "error":   this.onError?.(data.message || "Engine error"); break;
        default: if (data.content) this.onMessage?.(data);
      }
    };

    this.ws.onerror = () => this._setStatus("error");

    this.ws.onclose = () => {
      this._setStatus("disconnected");
      if (this.autoReconnect) {
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      }
    };
  }

  disconnect() {
    this.autoReconnect = false;
    clearTimeout(this.reconnectTimer);
    if (this.ws) { this.ws.close(); this.ws = null; }
    this._setStatus("disconnected");
  }

  send(content, history = []) {
    if (!this.isConnected()) throw new Error("Local engine not connected");
    this.ws.send(JSON.stringify({
      type: "message",
      role: "user",
      content,
      history: history.slice(-12).map(m => ({ role: m.role, content: m.text || "" })),
    }));
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const localChatBridge = new LocalChatBridge();