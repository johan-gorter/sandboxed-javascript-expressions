/**
 * All values used in expressions that are not primitives (string, number, boolean) and functions are wrapped to control property access.
 */
export interface JsExpressionWrappedValue<Wrapped> {
  wrapped: Wrapped;
  accessProperty(propertyName: string): any;
}

// Never call `obj.hasOwnProperty(...)`, an object in the scope can define its own `hasOwnProperty`
// which always returns true and thereby pose as a wrapped value.
let hasOwnProperty = Object.prototype.hasOwnProperty;

export let isJsExpressionWrappedValue = (obj: any): obj is JsExpressionWrappedValue<any> => {
  return obj && hasOwnProperty.call(obj, "wrapped") && hasOwnProperty.call(obj, "accessProperty");
};
