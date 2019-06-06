import { expect } from 'chai';
import { compileJsExpression } from '../src/compiler';
import { noop } from './test-utilities';

describe('errors', () => {
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
