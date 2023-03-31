type ConvertiblePrimitive = string | number | boolean;

export function getEnvVar<T extends ConvertiblePrimitive = string>(
  name: string,
  defaultValue?: T,
): T {
  const value = process.env[name];
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Environment variable ${name} not set.`);
    }
    return defaultValue;
  }

  if (defaultValue !== undefined && typeof defaultValue === 'number') {
    return parseFloat(value) as unknown as T;
  }
  if (defaultValue !== undefined && typeof defaultValue === 'boolean') {
    return (value.toLowerCase() === 'true') as unknown as T;
  }
  return value as unknown as T;
}
