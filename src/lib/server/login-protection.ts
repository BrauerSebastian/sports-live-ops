type AttemptWindow = { count: number; resetAt: number };

const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 8;

const globalStore = globalThis as typeof globalThis & {
  sportsLiveOpsLoginAttempts?: Map<string, AttemptWindow>;
};

const attempts = globalStore.sportsLiveOpsLoginAttempts ?? new Map<string, AttemptWindow>();
globalStore.sportsLiveOpsLoginAttempts = attempts;

function normalizedKey(email: string) {
  return email.trim().toLowerCase().slice(0, 320);
}

export function consumeLoginAttempt(email: string) {
  const key = normalizedKey(email);
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (current.count >= MAX_ATTEMPTS) return false;
  current.count += 1;
  return true;
}

export function clearLoginAttempts(email: string) {
  attempts.delete(normalizedKey(email));
}
