/**
 * @source https://github.com/dubzzz/fast-check/blob/296cde419382eac6fe257ac4105a893dbdf5cfcc/packages/fast-check/src/arbitrary/_internals/helpers/JsonConstraintsBuilder.ts
 */

export interface JsonArray extends Array<JsonValue> {}

export type JsonObject = { [key in string]?: JsonValue };

export type JsonValue =
  | boolean
  | number
  | string
  | null
  | JsonArray
  | JsonObject;
