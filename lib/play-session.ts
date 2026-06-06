export const PLAY_SESSION_STORAGE_KEY = "siguldabeach-play-session";

export function loadPlaySession<T>(): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(PLAY_SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function savePlaySession(data: unknown): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(PLAY_SESSION_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save play session:", error);
  }
}

export function clearPlaySession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PLAY_SESSION_STORAGE_KEY);
}
