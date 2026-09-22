export interface StorageAdapter {
  get<T>(key: string, fallback: T, validate: (value: unknown) => value is T): T
  set<T>(key: string, value: T): void
}

export const storage: StorageAdapter = {
  get<T>(key: string, fallback: T, validate: (value: unknown) => value is T): T {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch (error) {
      console.warn(`Stored value for "${key}" could not be parsed. Resetting it.`, error)
      localStorage.removeItem(key)
      return fallback
    }
    if (!validate(parsed)) {
      console.warn(`Stored value for "${key}" has an invalid shape. Resetting it.`)
      localStorage.removeItem(key)
      return fallback
    }
    return parsed
  },
  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value))
  },
}
