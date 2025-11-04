"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryAssert = retryAssert;
exports.assertTextEquals = assertTextEquals;
exports.assertContains = assertContains;
exports.assertAttribute = assertAttribute;
const chai_1 = require("chai");
const ConfigLoader_1 = require("../config/ConfigLoader");
const testConfig = ConfigLoader_1.configLoader.getTestConfig();
const defaultRetryTimeout = testConfig.retryCount * testConfig.retryInterval;
async function retryAssert(checkFn, timeout = defaultRetryTimeout, interval = testConfig.retryInterval) {
    const start = Date.now();
    let lastErr = null;
    while (Date.now() - start < timeout) {
        try {
            await checkFn();
            return;
        }
        catch (err) {
            lastErr = err;
            await new Promise(r => setTimeout(r, interval));
        }
    }
    throw lastErr || new Error('Assertion timed out');
}
async function assertTextEquals(getTextFn, expected, timeout = defaultRetryTimeout) {
    await retryAssert(async () => {
        const txt = (await getTextFn()).trim();
        (0, chai_1.expect)(txt).to.equal(expected);
    }, timeout);
}
async function assertContains(getTextFn, expectedSubstring, timeout = defaultRetryTimeout) {
    await retryAssert(async () => {
        const txt = (await getTextFn()).trim();
        (0, chai_1.expect)(txt).to.include(expectedSubstring);
    }, timeout);
}
async function assertAttribute(getAttrFn, name, expected, timeout = defaultRetryTimeout) {
    await retryAssert(async () => {
        const value = await getAttrFn();
        (0, chai_1.expect)(value).to.equal(expected);
    }, timeout);
}
