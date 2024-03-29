/**
 * This is the API that expressions need to execute. We recommend using createDefaultJsExpressionContext if possible, because it is tested for security.
 */
export interface JsExpressionContext {
  /**
   * This method is used to provide the value for a variable to the expression.
   * Only expose objects, values and functions here that may be used by the expression.
   */
  getValue(variableOrFunctionName: string): any;

  /**
   * This method is used to access properties on objects in the expression (like Math.abs).
   * WARNING: Do not use the implementation of accessProperty `return on[propertyName]`, because
   * this leaks things like `Object.constructor` which can be used to escape the sandbox.
   */
  accessProperty(on: any, propertyName: string): any;
}

export let createDefaultJsExpressionContext = (scope: {
  [index: string]: any;
}): JsExpressionContext => {
  return {
    getValue: (variableOrFunctionName) => scope[variableOrFunctionName],
    accessProperty: (on: any, propertyName: string) =>
      on && on.hasOwnProperty(propertyName) ? on[propertyName] : undefined,
  };
};
