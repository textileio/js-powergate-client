export function useValue<T>(initialValue: T) {
  let value = initialValue
  const get = () => value
  const set = (v: T) => {
    value = v
  }
  return Object.freeze({ get, set })
}
