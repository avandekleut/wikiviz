export type ConvertiblePrimitive = string | number | boolean

export function get<T extends ConvertiblePrimitive = string>(
  value: string | undefined,
  defaultValue?: T | undefined,
): T {
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(
        `Could not get value ${value} undefined and defaultValue not set.`,
      )
    }
    return defaultValue
  }

  if (defaultValue !== undefined && typeof defaultValue === 'number') {
    return parseFloat(value) as unknown as T
  }
  if (defaultValue !== undefined && typeof defaultValue === 'boolean') {
    return (value.toLowerCase() === 'true') as unknown as T
  }
  return value as unknown as T
}
