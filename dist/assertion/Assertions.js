import { expect } from 'chai';
export async function retryAssert(checkFn, timeout = 5000, interval = 200) {
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
export async function assertTextEquals(getTextFn, expected, timeout = 5000) {
    await retryAssert(async () => {
        const txt = (await getTextFn()).trim();
        expect(txt).to.equal(expected);
    }, timeout);
}
export async function assertContains(getTextFn, expectedSubstring, timeout = 5000) {
    await retryAssert(async () => {
        const txt = (await getTextFn()).trim();
        expect(txt).to.include(expectedSubstring);
    }, timeout);
}
export async function assertAttribute(getAttrFn, name, expected, timeout = 5000) {
    await retryAssert(async () => {
        const value = await getAttrFn();
        expect(value).to.equal(expected);
    }, timeout);
}
