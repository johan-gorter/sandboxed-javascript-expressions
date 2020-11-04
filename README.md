# TODO
- Regex example

# Sandboxed javascript expressions
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

Only expressions are supported, so no assignments, code blocks, etc.

### Features
- Uses native eval, so it is very fast
- Very tiny footprint (<2 Kb gzipped)
- Tested extensively for security
- Custom functionality can be provided using helper functions and objects

### Some limitations:
- String literals must use double quotes (no double quotes or interpolation)
- Regular expressions cannot use the literal notation
- Lambda functions cannot have parameters (see `example-tests.ts` on how to deal with this limitation)
- You cannot access functions on an object's prototype (like `"".substr(1)`). This is by design and you can use helper functions to access them.
- Object literals are not yet supported. Support can be added easily if the keys require quotes (JSON style).
