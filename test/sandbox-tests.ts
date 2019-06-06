import { compileJsExpression } from '../src';
import { cleanupEscape, createTestSession, dangerousTokens, forEachCombination, recognizedTokens, setupEscape, testContext } from './brute-force-utilities';
import { expect } from 'chai';

/* tslint:disable mocha-no-side-effect-code */

describe('sandbox', () => {
  it('cannot escape the sandbox by using a regular expression', () => {
    setupEscape();
    expect(() => compileJsExpression('/\'/.esc(/\'/)')).to.throw();
    cleanupEscape();
  });

  it('cannot break the sandbox using a combination of recognized tokens', () => {
    setupEscape();

    let session = createTestSession(testContext);

    forEachCombination(recognizedTokens, 1, 5 /* this can be done in reasonable computing time */, session.run);

    cleanupEscape();
  }).timeout(24 * 60 * 60 * 1000); // 24 hours

  it('cannot break the sandbox using a combination of dangerous tokens', () => {
    setupEscape();

    let session = createTestSession(testContext);

    forEachCombination(dangerousTokens, 6, 6 /* this can be done in reasonable computing time */, session.run);

    cleanupEscape();
  }).timeout(24 * 60 * 60 * 1000); // 24 hours
});
