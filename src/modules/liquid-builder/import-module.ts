// it is async since we have to change the implementation to use import instead of require
export async function importModule<T = unknown>(modulePath: string, defaultValue: T | null = null): Promise<T> {
  try {
    //  removing the cache first
    delete require.cache[require.resolve(modulePath)]
    const module = require(modulePath)

    // Transform to ESM-like structure
    return {
      ...module,
      __esModule: true,
      default: module.default || module,
    } as T
  } catch (error) {
    if (defaultValue !== null) {
      return defaultValue
    }

    throw new Error(`Module import failure: ${modulePath}\n${(error as Error).message}`)
  }
}
