import { compileJsExpression, createDefaultJsExpressionContext, JsExpressionWrappedValue } from '../src';
import { expect } from 'chai';

describe('examples', () => {
  it('basic usage', () => {
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

    expect(outcome).to.equal(45);
  });

  it('can even do parameter-less lambda\'s', () => {
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

  it('can access string functions using a helper', () => {
    let expression = `length(param) % 2 == 0`;
    let context = createDefaultJsExpressionContext({ param: '123', length: (a: string) => a.length });
    let result = compileJsExpression(expression)(context);
    expect(result).to.equal(false);
  });

  it('allows dynamic properties to be accessed', () => {
    let expression = 'lookup[key]';
    let scope = { lookup: { key1: 'value1' }, key: 'key1' };
    let context = createDefaultJsExpressionContext(scope);
    expect(compileJsExpression(expression)(context)).to.equal('value1');
  });

  it('can use functions provided in the scope that take wrappedValues as parameter', () => {
    let context = createDefaultJsExpressionContext({
      param: { num: 5, exp: 2 },
      square: (bigNum: JsExpressionWrappedValue<{ num: number, exp: number }>) => ({ num: bigNum.wrapped.num * bigNum.wrapped.num, exp: bigNum.wrapped.exp })
    });
    let expression = `square(param)`;
    let result = compileJsExpression(expression)(context);
    expect(result).to.deep.equal({ num: 25, exp: 2 });
  });

  it('can even evaluate hyperscript', () => {
    let expression = `h('del', ['[Trashed]', description])`;
    let scope = {
      h: (tagName: string, children: JsExpressionWrappedValue<string[]>) => ({ tagName, children: children.wrapped }),
      description: 'ItemDescription'
    };
    let context = createDefaultJsExpressionContext(scope);
    let result = compileJsExpression(expression)(context);
    expect(result).to.deep.equal({ tagName: 'del', children: ['[Trashed]', 'ItemDescription'] });
  });
});
