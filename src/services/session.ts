import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { ApiUser, SessionUser } from "../types/api";

type PendingVerification = {
  email: string;
};

type RecoveryChallenge = {
  email: string;
  code: string;
};

const ACCESS_TOKEN_KEY = "vila-rica.access-token";
const USER_KEY = "vila-rica.user";
const TWO_FACTOR_KEY = "vila-rica.two-factor";
const RECOVERY_EMAIL_KEY = "vila-rica.recovery-email";
const RECOVERY_CHALLENGE_KEY = "vila-rica.recovery-challenge";
const webMemoryFallback = new Map<string, string>();

function getWebStorage(): Storage | null {
  if (Platform.OS !== "web") return null;
  try {
    return typeof globalThis.sessionStorage === "undefined"
      ? null
      : globalThis.sessionStorage;
  } catch {
    return null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    const webStorage = getWebStorage();
    if (webStorage) webStorage.setItem(key, value);
    else webMemoryFallback.set(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return getWebStorage()?.getItem(key) ?? webMemoryFallback.get(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    getWebStorage()?.removeItem(key);
    webMemoryFallback.delete(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

async function getJson<T>(key: string): Promise<T | null> {
  const raw = await getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    await removeItem(key);
    return null;
  }
}

export async function saveSession(accessToken: string, user: ApiUser): Promise<void> {
  const sessionUser: SessionUser = {
    _id: user._id,
    name: user.name,
    role: user.role,
  };

  await Promise.all([
    setItem(ACCESS_TOKEN_KEY, accessToken),
    setItem(USER_KEY, JSON.stringify(sessionUser)),
  ]);
}

export function getAccessToken(): Promise<string | null> {
  return getItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser(): Promise<SessionUser | null> {
  return getJson<SessionUser>(USER_KEY);
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    removeItem(ACCESS_TOKEN_KEY),
    removeItem(USER_KEY),
    removeItem(TWO_FACTOR_KEY),
    removeItem(RECOVERY_EMAIL_KEY),
    removeItem(RECOVERY_CHALLENGE_KEY),
  ]);
}

export function saveTwoFactorEmail(email: string): Promise<void> {
  return setItem(TWO_FACTOR_KEY, JSON.stringify({ email }));
}

export function getTwoFactorEmail(): Promise<PendingVerification | null> {
  return getJson<PendingVerification>(TWO_FACTOR_KEY);
}

export function clearTwoFactorEmail(): Promise<void> {
  return removeItem(TWO_FACTOR_KEY);
}

export function saveRecoveryEmail(email: string): Promise<void> {
  return setItem(RECOVERY_EMAIL_KEY, JSON.stringify({ email }));
}

export function getRecoveryEmail(): Promise<PendingVerification | null> {
  return getJson<PendingVerification>(RECOVERY_EMAIL_KEY);
}

export function clearRecoveryEmail(): Promise<void> {
  return removeItem(RECOVERY_EMAIL_KEY);
}

export function saveRecoveryChallenge(email: string, code: string): Promise<void> {
  return setItem(RECOVERY_CHALLENGE_KEY, JSON.stringify({ email, code }));
}

export function getRecoveryChallenge(): Promise<RecoveryChallenge | null> {
  return getJson<RecoveryChallenge>(RECOVERY_CHALLENGE_KEY);
}

export function clearRecoveryChallenge(): Promise<void> {
  return removeItem(RECOVERY_CHALLENGE_KEY);
}

