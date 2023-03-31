import { get } from './get-with-default'

type ConvertiblePrimitive = string | number | boolean

export function getEnvVar<T extends ConvertiblePrimitive = string>(
  name: string,
  defaultValue?: T,
): T {
  const value = process.env[name]
  return get(value, defaultValue)
}
