export function env(name: string, json = false) {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}
