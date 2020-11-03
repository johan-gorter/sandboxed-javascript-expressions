import { isJsExpressionWrappedValue } from './expression-wrapped-value';
import { JsExpressionContext } from './expression-context';

/* tslint:disable function-constructor no-function-constructor-with-string-args */

let isWord = (char: string) => {
  return /^[a-zA-Z_]$/.test(char);
};

let isDigit = (char: string) => {
  return /^[0-9]$/.test(char);
};

let isExpression = (char: string) => {
  return /^[?:+\-*/()%^=<>!&|, ]$/.test(char);
};

export type CompiledJsExpression = ((context: JsExpressionContext) => any);

export let compileJsExpression = (expression: string): CompiledJsExpression => {
  let mode: 'clean' | 'cleanOrChain' | 'word' | 'path' | 'string' | 'escapedInString' | 'number' | 'decimalPart' = 'clean';
  let safeExpression = 'return ';
  let invalidChar = (char: string) => {
    throw new Error(`Invalid char at: ${safeExpression}${char}`);
  };
  for (let char of expression) {
    switch (mode) {
      case 'clean':
      case 'cleanOrChain':
        if (isWord(char)) {
          safeExpression += `interpret("${char}`;
          mode = 'word';
        } else if (isDigit(char)) {
          safeExpression += char;
          mode = 'number';
        } else if (char === '[') {
          if (mode === 'clean') {
            safeExpression += `createArray(`;
          } else {
            safeExpression += `.accessProperty(`;
            mode = 'clean';
          }
        } else if (char === ']') {
          safeExpression += `)`;
          mode = 'cleanOrChain';
        } else if (char === '/') {
          safeExpression += ` /1/ `; // Make sure / cannot be used to form a regex, just to do division
          mode = 'clean';
        } else if (isExpression(char)) {
          safeExpression += char;
          if (char === ')') {
            mode = 'cleanOrChain';
          } else {
            mode = 'clean';
          }
        } else if (char === '\'') {
          safeExpression += char;
          mode = 'string';
        } else if (char === '.' && mode === 'cleanOrChain') {
          safeExpression += `.accessProperty("`;
          mode = 'path';
        } else {
          invalidChar(char);
        }
        break;
      case 'word':
        if (isWord(char) || isDigit(char)) {
          safeExpression += char;
        } else if (char === '.') {
          safeExpression += `").accessProperty("`;
          mode = 'path';
        } else if (isExpression(char)) {
          safeExpression += `")${char}`;
          if (char === ')') {
            mode = 'cleanOrChain';
          } else {
            mode = 'clean';
          }
        } else if (char === '[') {
          safeExpression += `").accessProperty(`;
          mode = 'clean';
        } else if (char === ']') {
          safeExpression += `"))`;
          mode = 'cleanOrChain';
        } else {
          invalidChar(char);
        }
        break;
      case 'path':
        if (isWord(char) || isDigit(char)) {
          safeExpression += char;
        } else if (char === '.') {
          safeExpression += `").accessProperty("`;
        } else if (isExpression(char)) {
          safeExpression += `")${char}`;
          mode = 'clean';
        } else if (char === '[') {
          safeExpression += `").accessProperty(`;
          mode = 'clean';
        } else if (char === ']') {
          safeExpression += `")`;
          mode = 'cleanOrChain';
        } else {
          invalidChar(char);
        }
        break;
      case 'string':
        if (char === '\'') {
          mode = 'clean';
        } else if (char === '\\') {
          mode = 'escapedInString';
        }
        safeExpression += char;
        break;
      case 'number':
        if (char === '.') {
          safeExpression += char;
          mode = 'decimalPart';
        } else if (isExpression(char)) {
          safeExpression += char;
          mode = 'clean';
        } else if (char === ']') {
          safeExpression += `)`;
          mode = 'cleanOrChain';
        } else if (isDigit(char)) {
          safeExpression += char;
        } else {
          invalidChar(char);
        }
        break;
      case 'decimalPart':
        if (isExpression(char)) {
          mode = 'clean';
        } else if (char === ']') {
          safeExpression += `)`;
          mode = 'clean';
        } else if (!isDigit(char)) {
          invalidChar(char);
        }
        safeExpression += char;
        break;
      case 'escapedInString':
        safeExpression += char;
        mode = 'string';
        break;
      default:
        invalidChar(char);
    }
  }
  if (mode === 'path' || mode === 'word') {
    safeExpression += '")';
  } else if (mode !== 'clean' && mode !== 'cleanOrChain' && mode !== 'number' && mode !== 'decimalPart') {
    throw new Error(`Invalid end of expression: ${expression}`);
  }
  let executeFunction = new Function('interpret', 'createArray', safeExpression);
  return (context) => {
    let wrapPropertyAccessors = (wrapped: any) => {
      if (typeof wrapped === 'string' || typeof wrapped === 'function' || typeof wrapped === 'boolean'
        || typeof wrapped === 'number' || wrapped === undefined || wrapped === null) {
        return wrapped;
      } else {
        return {
          wrapped,
          accessProperty: (propertyName: string) => wrapPropertyAccessors(context.accessProperty(wrapped, propertyName))
        };
      }
    };

    let result = executeFunction(interpret, createArray);
    if (isJsExpressionWrappedValue(result)) {
      return result.wrapped;
    }
    return result;

    function interpret(variableOrFunction: string) {
      let value = context.getValue(variableOrFunction);
      if (typeof value === 'function') {
        return (...args: any[]) => wrapPropertyAccessors(value(...args));
      } else {
        return wrapPropertyAccessors(value);
      }
    }

    function createArray(...args: unknown[]) {
      return {
        wrapped: args.map(arg => isJsExpressionWrappedValue(arg) ? arg.wrapped : arg),
        accessProperty(index: unknown) {
          if (typeof index === 'number') {
            return args[index];
          }
        }
      };
    }
  };
};
