export const isNode = typeof window === "undefined"

export function useValue<T>(
  initialValue: T,
): Readonly<{
  get: () => T
  set: (v: T) => void
}> {
  let value = initialValue
  const get = () => value
  const set = (v: T) => {
    value = v
  }
  return Object.freeze({ get, set })
}
