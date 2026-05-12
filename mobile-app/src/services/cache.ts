import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'grandhr_cache_v1:';

interface Entry<T> {
  v: T;
  t: number; // timestamp ms
}

/**
 * Lightweight TTL cache backed by AsyncStorage. Use to power offline-first
 * reads of GET endpoints (dashboard, attendance, leaves, documents).
 */
export const Cache = {
  async get<T>(key: string, maxAgeMs?: number): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(PREFIX + key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Entry<T>;
      if (maxAgeMs && Date.now() - parsed.t > maxAgeMs) return null;
      return parsed.v;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(
        PREFIX + key,
        JSON.stringify({ v: value, t: Date.now() } satisfies Entry<T>),
      );
    } catch {
      // best-effort
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(PREFIX + key);
    } catch {
      // best-effort
    }
  },

  async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const ours = keys.filter((k) => k.startsWith(PREFIX));
      if (ours.length) await AsyncStorage.multiRemove(ours);
    } catch {
      // best-effort
    }
  },

  /**
   * Convenience: try a network call; on failure return cached value.
   * Successful results are written back to the cache.
   */
  async withFallback<T>(
    key: string,
    fetcher: () => Promise<T>,
    opts?: { maxAgeMs?: number },
  ): Promise<{ data: T | null; fromCache: boolean }> {
    try {
      const fresh = await fetcher();
      await Cache.set(key, fresh);
      return { data: fresh, fromCache: false };
    } catch {
      const cached = await Cache.get<T>(key, opts?.maxAgeMs);
      return { data: cached, fromCache: cached !== null };
    }
  },
};
