/**
 * All values used in expressions that are not primitives (string, number, boolean) and functions are wrapped to control property access.
 */
export interface JsExpressionWrappedValue<Wrapped> {
  wrapped: Wrapped;
  accessProperty(propertyName: string): any;
}

export let isJsExpressionWrappedValue = (obj: any): obj is JsExpressionWrappedValue<any> => {
  return obj && obj.hasOwnProperty("wrapped") && obj.hasOwnProperty("accessProperty");
};
