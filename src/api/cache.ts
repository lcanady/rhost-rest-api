import { curlResponse } from "./api";

export interface CurlCacheEntry {
  ttl: number;
  payload: curlResponse;
}

export interface CurlCacheStore {
  ttl: number;
  ms: number;
  payload: curlResponse;
}

export class CurlCache {
  private _ttlCheck: number;
  private _cache: Map<string, CurlCacheStore>;
  private _timeout: any;

  /**
   * new Cache()
   * @param TTLCheck How often the cache should check for stale entries.
   */
  constructor(ttlCheck?: number) {
    this._ttlCheck = ttlCheck || 600;
    this._cache = new Map();

    // Start the cache TTL timer.
    this._timeout = setInterval(() => {
      if (this._cache.keys()) {
        const time = new Date();
        for (const key of Array.from(this._cache.keys())) {
          const entry = this._cache.get(key);
          if (time.getTime() >= entry.ms) {
            this._cache.delete(key);
          }
        }
      }
    }, this._ttlCheck);
  }

  set(key: string, value: CurlCacheEntry, ttl: number = 10000): curlResponse {
    const time = new Date();
    const entry: CurlCacheStore = {
      ...value,
      ms: time.getTime() + ttl
    };

    this._cache.set(key, entry);
    return this._cache.get(key).payload;
  }

  get(key: string) {
    return this._cache.get(key).payload;
  }

  has(key: string) {
    return this._cache.has(key);
  }

  stop() {
    clearInterval(this._timeout);
  }
}

export default new CurlCache();
