// app.js (ES Module)

// ---------- Canal de mensajería compartido ----------
const CHANNEL_NAME = "simulador";
const ch = new BroadcastChannel(CHANNEL_NAME);

/**
 * Enviar mensaje al otro contexto (panel <-> stage)
 * @param {any} msg
 */
export function busSend(msg) {
  try {
    ch.postMessage(msg);
  } catch (e) {
    console.error("busSend error:", e);
  }
}

/**
 * Suscribirse a los mensajes
 * @param {(msg:any)=>void} handler
 */
export function busOn(handler) {
  ch.onmessage = (e) => {
    try {
      handler(e.data);
    } catch (err) {
      console.error("busOn handler error:", err);
    }
  };
}

/**
 * Abrir la ventana del proyector (stage)
 */
export function openStage() {
  // target con nombre para reusar la misma ventana; features básicas
  window.open("stage.html", "stage", "noopener,noreferrer,width=1280,height=720");
}

// ---------- Utilidades ----------
/**
 * Formatea segundos a MM:SS
 * @param {number} seg
 * @returns {string}
 */
export function formatMMSS(seg) {
  const m = Math.floor(seg / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seg % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

// ---------- Almacenamiento local de sesiones ----------
const PREFIX = "simulador_historial_";

/**
 * Lee JSON seguro de localStorage
 * @param {string} key
 * @returns {any}
 */
function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Escribe JSON seguro en localStorage
 * @param {string} key
 * @param {any} val
 */
function writeJSON(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error("writeJSON error:", e);
  }
}

export const Store = {
  /**
   * Agrega una sesión al historial del paciente
   * @param {string} id  identificador del paciente
   * @param {{ts:number, escenario:string, seg:number, km:number}} rec
   */
  addSesion(id, rec) {
    const key = PREFIX + id;
    const data = readJSON(key) || [];
    data.push(rec);
    writeJSON(key, data);
  },

  /**
   * Devuelve el historial del paciente (array)
   * @param {string} id
   * @returns {Array<{ts:number, escenario:string, seg:number, km:number}>}
   */
  getHistorial(id) {
    const key = PREFIX + id;
    return readJSON(key) || [];
  },
};
