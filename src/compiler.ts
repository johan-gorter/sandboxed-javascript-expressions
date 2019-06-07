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
  let mode: 'normal' | 'normalAfterBracket' | 'word' | 'path' | 'string' | 'escapedInString' | 'number' | 'decimalPart' = 'normal';
  let safeExpression = 'return ';
  let invalidChar = (char: string) => {
    throw new Error(`Invalid char at: ${safeExpression}${char}`);
  };
  for (let char of expression) {
    switch (mode) {
      case 'normalAfterBracket':
        if (char === '.') {
          safeExpression += `.accessProperty('`;
          mode = 'path';
        } else if (char === '[') {
          safeExpression += `.accessProperty(`;
          mode = 'normal';
        } else if (char === ']') {
          safeExpression += `)`;
          mode = 'normal';
        } else if (isExpression(char)) {
          mode = 'normal';
          safeExpression += char;
        } else {
          invalidChar(char);
        }
        break;
      case 'normal':
        if (isWord(char)) {
          safeExpression += `interpret('${char}`;
          mode = 'word';
        } else if (isDigit(char)) {
          safeExpression += char;
          mode = 'number';
        } else if (char === '[') {
          safeExpression += `.accessProperty(`;
        } else if (char === ']') {
          safeExpression += `)`;
        } else if (char === '/') {
          safeExpression += ` /1/ `; // Make sure / cannot be used to form a regex, just to do division
        } else if (isExpression(char)) {
          safeExpression += char;
          if (char === ')') {
            mode = 'normalAfterBracket';
          }
        } else if (char === '\'') {
          safeExpression += char;
          mode = 'string';
        } else {
          invalidChar(char);
        }
        break;
      case 'word':
        if (isWord(char) || isDigit(char)) {
          safeExpression += char;
        } else if (char === '.') {
          safeExpression += `').accessProperty('`;
          mode = 'path';
        } else if (isExpression(char)) {
          safeExpression += `')${char}`;
          mode = 'normal';
        } else if (char === '[') {
          safeExpression += `').accessProperty(`;
          mode = 'normal';
        } else if (char === ']') {
          safeExpression += `'))`;
          mode = 'normal';
        } else {
          invalidChar(char);
        }
        break;
      case 'path':
        if (isWord(char) || isDigit(char)) {
          safeExpression += char;
        } else if (char === '.') {
          safeExpression += `').accessProperty('`;
        } else if (isExpression(char)) {
          safeExpression += `')${char}`;
          mode = 'normal';
        } else if (char === '[') {
          safeExpression += `.accessProperty(`;
          mode = 'normal';
        } else if (char === ']') {
          safeExpression += `)`;
          mode = 'normal';
        } else {
          invalidChar(char);
        }
        break;
      case 'string':
        if (char === '\'') {
          mode = 'normal';
        } else if (char === '\\') {
          mode = 'escapedInString';
        }
        safeExpression += char;
        break;
      case 'number':
        if (char === '.') {
          mode = 'decimalPart';
        } else if (isExpression(char)) {
          mode = 'normal';
        } else if (char === ']') {
          safeExpression += `)`;
          mode = 'normal';
        } else if (!isDigit(char)) {
          invalidChar(char);
        }
        safeExpression += char;
        break;
      case 'decimalPart':
        if (isExpression(char)) {
          mode = 'normal';
        } else if (char === ']') {
          safeExpression += `)`;
          mode = 'normal';
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
    safeExpression += '\')';
  } else if (mode !== 'normal' && mode !== 'normalAfterBracket' && mode !== 'number' && mode !== 'decimalPart') {
    throw new Error(`Invalid end of expression: ${expression}`);
  }
  let executeFunction = new Function('interpret', safeExpression);
  return (context) => {
    let wrapPropertyAccessors = (wrapped: any) => {
      if (typeof wrapped === 'string' || typeof wrapped === 'boolean' || typeof wrapped === 'number' || wrapped === undefined || wrapped === null) {
        return wrapped;
      } else {
        return {
          wrapped,
          accessProperty: (propertyName: string) => context.accessProperty(wrapped, propertyName)
        };
      }
    };
    let interpretFunction = (variableOrFunction: string) => {
      let value = context.getValue(variableOrFunction);
      if (typeof value === 'function') {
        return (...args: any[]) => wrapPropertyAccessors(value(...args));
      } else {
        return wrapPropertyAccessors(value);
      }
    };
    let result = executeFunction(interpretFunction);
    if (isJsExpressionWrappedValue(result)) {
      return result.wrapped;
    }
    return result;
  };
};
