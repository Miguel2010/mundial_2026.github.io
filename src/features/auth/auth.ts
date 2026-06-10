const SESSION_KEY = 'mundial-2026-session';
const PASSWORD_HASH = '1ea27ace602a201439f6107354abad8b7262353769a5a08f8a1abd4284abbfe1';

export type AuthSession = {
  participante: string;
};

export async function verifyPassword(password: string) {
  const encodedPassword = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedPassword);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computedHash = hashArray.map((value) => value.toString(16).padStart(2, '0')).join('');

  return computedHash === PASSWORD_HASH;
}

export function getActiveSession(): AuthSession | null {
  const session = localStorage.getItem(SESSION_KEY);

  if (!session) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(session) as Partial<AuthSession>;
    const participante = parsedSession.participante?.trim();

    return participante ? { participante } : null;
  } catch {
    return null;
  }
}

export function createSession(session: AuthSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
