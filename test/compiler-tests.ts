import { expect } from 'chai';
import { CompiledJsExpression, compileJsExpression } from '../src/compiler';
import { createDefaultJsExpressionContext, JsExpressionContext } from '../src/expression-context';
import { JsExpressionWrappedValue } from '../src/expression-wrapped-value';
import { logger, noop } from './test-utilities';

/* tslint:disable mocha-no-side-effect-code no-null-keyword */

describe('js expression', () => {
  it('evaluates a normal expression', () => {
    let expression = 'entityKeyOf(url.id) === \'Attribute\'';
    let context: JsExpressionContext = {
      getValue: (variableName: string) => {
        switch (variableName) {
          case 'entityKeyOf':
            return (value: string) => value.split(':')[0];
          case 'url':
            return { path: '/attr', id: 'Attribute:attribute1' };
          default:
            throw new Error();
        }
      },
      accessProperty: (on: any, propertyName: string): any => {
        return on && on[propertyName];
      }
    };
    let result = compileJsExpression(expression)(context);
    expect(result).to.equal(true);
  });

  it('allows dynamic properties to be accessed', () => {
    let expression = 'lookup[key]';
    let lookup1 = {};
    let context: JsExpressionContext = {
      getValue: (name) => name === 'lookup' ? lookup1 : name === 'key' ? 'key1' : undefined,
      accessProperty: (on: any, propertyName: string) => {
        expect(on).to.equal(lookup1);
        expect(propertyName).to.equal('key1');
        return 'value1';
      }
    };
    expect(compileJsExpression(expression)(context)).to.equal('value1');
  });

  it('can even do parameter-less labmda\'s', () => {
    let expression = `filter(items, 'item', () => item.value > 0)`;
    let scope: { [variableOrFunctionName: string]: any } = {};
    let context = createDefaultJsExpressionContext(scope);
    scope.items = [{ value: 1 }, { value: -1 }, { value: 3 }];
    scope.filter = (items: JsExpressionWrappedValue<any[]>, variableName: string, callback: () => boolean) => {
      return items.wrapped.filter(item => {
        scope[variableName] = item;
        let result = callback();
        delete scope[variableName];
        return result;
      });
    };
    let filteredItems = compileJsExpression(expression)(context);
    expect(filteredItems).to.deep.equal([{ value: 1 }, { value: 3 }]);
  });

  it('cannot break the sandbox', () => {
    let throwBroken = () => { throw new Error('broken'); };
    // putting 's' on Object.prototype makes it accessible from everywhere, even from global
    Object.defineProperty(Object.prototype, 's', { get: throwBroken, set: throwBroken, configurable: true });
    // these things now throws a broken Error:
    // new Function('return s')();
    // new Function('return \'a\'.s')();
    let variables: { [index: string]: any } = Object.create(null);
    variables['a'] = { a: () => 's', b: 's' };
    variables['b'] = 's';
    let context = createDefaultJsExpressionContext(variables);
    let chars = 'abs ?:+\\-*()%^=<>!&|, .\'[]01'.split('');
    chars.push('()=>'); // add lambda call as a single char
    chars.push('a.a()');
    let errorMessages = new Set<string>();

    let test = (expression: string) => {
      let compiled: CompiledJsExpression | undefined;
      try {
        compiled = compileJsExpression(expression);
      } catch (SyntaxError) { /* very likely */ }
      if (compiled) {
        try {
          compiled(context);
        } catch (err) {
          expect(err.message).to.not.equal('broken', expression);
          if (!errorMessages.has(err.message)) {
            logger.info(`New error encountered: ${err.message}, expression: ${expression}`);
            errorMessages.add(err.message);
          }
        }
      }
    };

    let testAll = (prefix: string, charsToAdd: number) => {
      if (charsToAdd === 0) {
        test(prefix);
      } else {
        for (let char of chars) {
          testAll(prefix + char, charsToAdd - 1);
        }
      }
    };
    let maxLength = 5; // this can be done in reasonable comuting time, 6 or 7 would be more ambitious
    for (let length = 0; length < maxLength; length++) {
      testAll('', length);
    }
    delete (Object.prototype as any).s;
  }).timeout(24 * 60 * 60 * 1000); // 24 hours

  it('throws a SyntaxError during compile in case of an invalid expression', () => {
    let expression = 'entityKeyOf(url';
    expect(() => compileJsExpression(expression)).to.throw(SyntaxError);
  });

  it('throws an error at runtime in case of an invalid operation', () => {
    let expression = 'entityKeyOf = url';
    let compiled = compileJsExpression(expression);
    expect(() => compiled({ getValue: noop, accessProperty: noop })).to.throw(ReferenceError);
  });

  it('throws an error at runtime in case of a prohibited property accessor', () => {
    let expression = '(\'a\').toString()';
    let compiled = compileJsExpression(expression);
    expect(() => compiled({ getValue: noop, accessProperty: noop })).to.throw(TypeError);
  });
});
