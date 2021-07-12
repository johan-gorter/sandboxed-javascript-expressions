import { expect } from "chai";

import { compileJsExpression, createDefaultJsExpressionContext } from "../src";

// tslint:disable:mocha-no-side-effect-code

// tslint:disable:no-null-keyword

describe("supported constructs", () => {
  const scope = createDefaultJsExpressionContext({
    index: 1,
    obj: { a: 2, b: "3", c: [4, 5] },
    arr: [6, 7, 8],
    str: "c",
    null: null,
  });

  const scenarios: [string, unknown][] = [
    ["index", 1],
    ["obj.a", 2],
    ["arr[1]", 7],
    ["obj[str][index]", 5],
    ["obj.c[0]", 4],
    ["[8, 9, 10][index]", 9],
    ['obj["c"]', [4, 5]],
    ["index ? undefined : 3", undefined],
    ["((index)) ? ([null, arr]) : 3", [null, [6, 7, 8]]],
  ];

  scenarios.forEach((scenario) => {
    it(`evaluates "${scenario[0]}" correctly}`, () => {
      let expression = compileJsExpression(scenario[0]);
      let result = expression(scope);
      expect(result).to.deep.equal(scenario[1]);
    });
  });
});
