# sandboxed-javascript-expressions
Allows evaluating untrusted javascript expressions in a nodejs server and in browsers

### Usage
```js
// Expressions are compiled to a function for optimum performance.
let expression = compileJsExpression('Math.atan(deltaX / deltaY) * 180 / Math.PI'); // formula calculates an angle

// Here we specify the only variables that we are going to expose to the expression.
let scope = {
  Math,
  deltaX: 10,
  deltaY: 10
};

// Expressions interact with a JsExpressionContext API for ultimate flexibility. This is the default implementation.
let expressionContext = createDefaultJsExpressionContext(scope);

// Evaluate the expression
let outcome = expression(expressionContext);
```

### Features
- Uses native eval, so it is very fast
- Very tiny footprint (<2 Kb gzipped)
- Tested extensively for security

### What is supported
- Just expressions, so no statements
- Arrays
- String literals using single quotes only (no double quotes or interpolation)
- Lambda functions without parameters (see `example-tests.ts` on how to deal with this limitation)

### What is not supported
- Regular expression literals
- Object literals (curly brackets)
