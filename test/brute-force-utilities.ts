import { CompiledJsExpression, compileJsExpression, createDefaultJsExpressionContext, JsExpressionContext } from '../src';
import { logger } from './test-utilities';
import { expect } from 'chai';

/* tslint:disable no-null-keyword */

/**
 * Makes it easy to detect if the sandbox is broken. If malicious code cannot get to 'esc' than it will also not be able to get to
 * anything else that is sensitive.
 */
export let setupEscape = () => {
  let throwEscaped = () => { throw new Error('escaped'); };
  // putting 'esc' on Object.prototype makes it accessible from everywhere, even from global
  Object.defineProperty(Object.prototype, 'esc', { get: throwEscaped, set: throwEscaped, configurable: true });
  // these things now throw an 'escaped' Error:
  // new Function('esc')();
  // new Function('return \'a\'.esc')();
};

export let cleanupEscape = () => {
  delete (Object.prototype as any).esc;
};

/**
 * All tokens that get a special treatment within the expression compiler
 */
export let recognizedTokens: string[];

/**
 * Set of tokens that an attacker may find interesting to break the sandbox with
 */
export let dangerousTokens: string[];

recognizedTokens = 'ab?:+\\-*/()%^=<>!&|, ."[]01'.split('');
recognizedTokens.push('esc');
recognizedTokens.push('()=>');
recognizedTokens.push('a.a()');
recognizedTokens.push('\'esc\'');
recognizedTokens.push('(\'esc\')');
recognizedTokens.push('[\'esc\']');

dangerousTokens = ' ?\\/()=,."'.split('');
dangerousTokens.push('esc');
dangerousTokens.push('.constructor');
dangerousTokens.push('\'esc\'');
dangerousTokens.push('(\'esc\')');
dangerousTokens.push('[\'esc\']');

let scope: { [index: string]: any } = Object.create(null);
scope['a'] = { a: () => 'esc', b: 'esc' };
scope['b'] = 'esc';
export let testContext: JsExpressionContext = createDefaultJsExpressionContext(scope);

export let createTestSession = (context: JsExpressionContext) => {
  // To log everything not more than once
  let encounteredErrorMessages = new Set<string>();
  let encounteredResults = new Set<object>();

  return {
    run: (expression: string) => {
      let compiled: CompiledJsExpression | undefined;
      try {
        compiled = compileJsExpression(expression);
      } catch (invalidCharOrSyntaxError) { /* very likely */ }
      if (compiled) {
        try {
          let result = compiled(context);
          if (result && result.constructor !== RegExp && result.constructor !== Function && !encounteredResults.has(result)) {
            logger.info(`New result encountered: ${result}, expression: ${expression}`);
            encounteredResults.add(result);
          }
        } catch (err) {
          expect(err.message).to.not.equal('escaped', expression);
          if (!encounteredErrorMessages.has(err.message)) {
            logger.info(`New error encountered: ${err.message}, expression: ${expression}`);
            encounteredErrorMessages.add(err.message);
          }
        }
      }
    }
  };
};

export let forEachCombination = (tokens: string[], minLength: number, maxLength: number, callback: (combination: string) => void) => {
  let testAll = (prefix: string, tokensToAdd: number) => {
    if (tokensToAdd === 0) {
      callback(prefix);
    } else {
      for (let token of tokens) {
        testAll(prefix + token, tokensToAdd - 1);
      }
    }
  };
  for (let length = minLength; length < maxLength; length++) {
    testAll('', length);
  }
};
