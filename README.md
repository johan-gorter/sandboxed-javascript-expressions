# sandboxed-javascript-expressions
Allows evaluating untrusted javascript expressions in a nodejs server and in browsers

### BETA
Still being tested. Please do not use in production yet.

### Features
- Uses native eval, so it is very fast
- Very simple and lightweight library
- Tested extensively for security

### API
Expressions are evaluated using variables and functions you provide. You can also define how property accessors work.

### Example
Work in progress

### What is supported
- Just expressions, so no statements
- String literals using single quotes
- Lambda functions without parameters (see the tests on how to cope with this limitation)
