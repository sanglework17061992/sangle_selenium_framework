# Self-Healing Framework - Quick Start

## What You Have

Complete self-healing implementation that automatically fixes broken element locators when IDs change.

## Quick Test (5 minutes)

```bash
# Terminal 1: Start server
node demo-app/server.js

# Terminal 2: Run tests (baseline)
npm run build
export SELF_HEALING_ENABLED=true
npm run test:example -- tests/login-healing.spec.ts
```

Expected: All 8 tests pass.

## Trigger Healing

1. Edit `demo-app/public/login.html`
2. Change IDs:
   ```
   id="username-input" → id="username-field-new"
   id="password-input" → id="password-field-new"
   id="login-button" → id="login-btn-new"
   ```
3. Run tests again

Expected: Tests still pass (healing kicked in).

## How It Works

When element not found:
1. Try primary + fallback locators (from config)
2. Extract hints (text, id, class, data-attr)
3. Scan DOM for matches
4. Generate candidates (data-testid, id, xpath, css)
5. Validate - first match wins
6. Update config with new primary

## Files

**Core:**
- `src/core/elements/HintExtractor.ts`
- `src/core/elements/DOMScanner.ts`
- `src/core/elements/HealingEngine.ts`
- `src/config/LocatorConfigManager.ts`

**Demo:**
- `demo-app/server.js`
- `demo-app/public/login.html`
- `tests/login-healing.spec.ts`
- `config/locators.json`

**Docs:**
- `HEALING_TEST_GUIDE.md` - Test flow explanation
- `HEALING_USAGE.md` - Commands and configuration

## Verify

Check logs for phases:
- Phase 1: Try locators
- Phase 2: Extract hints
- Phase 3: Scan DOM
- Phase 4: Validate candidates
- Phase 5: Update config

## Next: Integration

Add to `SanElement.ts` in `findElement()`:
```typescript
try {
  return await this.driver.findElement(this.locator);
} catch (error) {
  if (this.healingConfig?.enabled) {
    const healed = await this.attemptHealing();
    if (healed) return healed;
  }
  throw error;
}
```

That's it. Tests don't change - healing is transparent.
