import { compileJsExpression, createDefaultJsExpressionContext } from '../src';
import { expect } from 'chai';

describe('sandbox escape attempts', () => {
  it('cannot access an object\'s constructor', () => {
    let compiled = compileJsExpression('Math.constructor');
    let result = compiled(createDefaultJsExpressionContext({ Math }));
    expect(result).to.be.undefined;
  });

  it('is unable to use reserved words', () => {
    let compiled = compileJsExpression('(null).constructor');
    expect(() => {
      // tslint:disable-next-line:no-null-keyword
      compiled(createDefaultJsExpressionContext({ Math, null: null }));
    }).to.throw();
  });

  it('is unable to get the constructor of a string constant', () => {
    expect(() => {
      compileJsExpression(`"".constructor`);
    }).to.throw();
  });

  it('is unable to get the constructor of a string from scope', () => {
    let compiled = compileJsExpression('a.constructor');
    expect(() => {
      compiled(createDefaultJsExpressionContext({ a: 'a' }));
    }).to.throw();
  });

  it('is unable to pollute global scope', () => {
    let compiled = compileJsExpression('a = 5');
    expect(() => {
      compiled(createDefaultJsExpressionContext({ a: 'a' }));
    }).to.throw();
  });
});
