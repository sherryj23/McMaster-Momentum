const CONNECTIONS_KEY = "macaihacks_connections";
const EXTRA_KEY = "macaihacks_extra";

export function saveConnections(data) {
  localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(data));
}

export function loadConnections() {
  try {
    const raw = localStorage.getItem(CONNECTIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveExtra(text) {
  localStorage.setItem(EXTRA_KEY, text);
}

export function loadExtra() {
  return localStorage.getItem(EXTRA_KEY) || "";
}
