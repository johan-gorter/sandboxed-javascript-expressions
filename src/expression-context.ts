export interface JsExpressionContext {
  getValue(variableOrFunctionName: string): any;
  accessProperty(on: any, propertyName: string): any;
}

export let createDefaultJsExpressionContext = (scope: { [index: string]: any }): JsExpressionContext => {
  return {
    getValue: (variableOrFunctionName) => scope[variableOrFunctionName],
    accessProperty: (on: any, propertyName: string) => (on && on.hasOwnProperty(propertyName)) ? on[propertyName] : undefined
  };
};
