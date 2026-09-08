import { expect } from "chai";

import {
  compileJsExpression,
  createDefaultJsExpressionContext,
  isJsExpressionWrappedValue,
} from "../src";

describe("sandbox escape attempts", () => {
  it("cannot access an object's constructor", () => {
    let compiled = compileJsExpression("Math.constructor");
    let result = compiled(createDefaultJsExpressionContext({ Math }));
    expect(result).to.be.undefined;
  });

  it("is unable to use reserved words", () => {
    let compiled = compileJsExpression("(null).constructor");
    expect(() => {
      // tslint:disable-next-line:no-null-keyword
      compiled(createDefaultJsExpressionContext({ Math, null: null }));
    }).to.throw();
  });

  it("is unable to get the constructor of a string constant", () => {
    expect(() => {
      compileJsExpression('"".constructor');
    }).to.throw();
  });

  it("is unable to get the constructor of a string from scope", () => {
    let compiled = compileJsExpression("a.constructor");
    expect(() => {
      compiled(createDefaultJsExpressionContext({ a: "a" }));
    }).to.throw();
  });

  it("cannot use an own hasOwnProperty implementation to leak the constructor", () => {
    let compiled = compileJsExpression("evil.constructor");
    // `evil` claims to own every property that is asked for
    let evil = { hasOwnProperty: () => true };
    let result = compiled(createDefaultJsExpressionContext({ evil }));
    expect(result).to.be.undefined;
  });

  it("cannot use an own hasOwnProperty implementation to pose as a wrapped value", () => {
    let evil = { hasOwnProperty: () => true };
    expect(isJsExpressionWrappedValue(evil)).to.be.false;
  });

  it("is unable to pollute global scope", () => {
    let compiled = compileJsExpression("a = 5");
    expect(() => {
      compiled(createDefaultJsExpressionContext({ a: "a" }));
    }).to.throw();
  });
});
