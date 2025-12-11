import { useEffect, useState } from 'react';

type Serializer<T> = (value: T) => string;
type Deserializer<T> = (value: string) => T;

interface UseLocalStorageOptions<T> {
  ttlMs?: number; // durée de vie en ms
  serialize?: Serializer<T>;
  deserialize?: Deserializer<T>;
}

interface StoredPayload<T> {
  savedAt: number;
  data: T;
}

export function useLocalStorage<T>(key: string, initialValue: T, options: UseLocalStorageOptions<T> = {}) {
  const { ttlMs, serialize = JSON.stringify, deserialize = JSON.parse } = options;

  const readValue = (): T => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return initialValue;
      const parsed = deserialize(raw) as StoredPayload<T> | T;
      if (parsed && typeof parsed === 'object' && 'savedAt' in (parsed as any) && 'data' in (parsed as any)) {
        const payload = parsed as StoredPayload<T>;
        const expired = typeof ttlMs === 'number' ? (Date.now() - payload.savedAt > ttlMs) : false;
        if (expired) {
          localStorage.removeItem(key);
          return initialValue;
        }
        return payload.data;
      }
      return parsed as T;
    } catch {
      return initialValue;
    }
  };

  const [value, setValue] = useState<T>(readValue);

  useEffect(() => {
    try {
      const payload: StoredPayload<T> = { savedAt: Date.now(), data: value };
      localStorage.setItem(key, serialize(payload as unknown as T));
    } catch {}
  }, [key, value, serialize]);

  return [value, setValue] as const;
}


