# Self-Healing - How to Use

## What It Does

When an element is not found (locator fails), self-healing automatically:
1. Tries primary locator + fallbacks (from config)
2. Extracts hints from all locators
3. Scans DOM and generates alternative locators
4. Validates candidates and finds element
5. Updates config with new primary locator

## How to Test

### Setup

```bash
# Build
npm run build

# Start demo app (Terminal 1)
node demo-app/server.js

# Run tests (Terminal 2)
export SELF_HEALING_ENABLED=true
export BASE_URL=http://localhost:3000
npm run test:example -- tests/login-healing.spec.ts
```

**Expected:** All tests pass ✓

### Trigger Healing

1. Edit `demo-app/public/login.html`
2. Change element IDs:
   - `id="username-input"` → `id="username-field-new"`
   - `id="password-input"` → `id="password-field-new"`
   - `id="login-button"` → `id="login-btn-new"`

3. Run tests again

**Expected:** Tests still pass (healing found elements via data-testid fallback)

## Configuration

Element locators defined in `config/locators.json`:
```json
{
  "usernameInput": {
    "primary": { "using": "id", "value": "username-input" },
    "fallbacks": [
      { "using": "xpath", "value": "//input[@name='username']" },
      { "using": "css", "value": "[data-testid='username-field']" }
    ]
  }
}
```

After successful healing, config updates:
```json
{
  "usernameInput": {
    "primary": { "using": "css", "value": "[data-testid='username-field']" },
    "fallbacks": [
      { "using": "id", "value": "username-input" },
      { "using": "xpath", "value": "//input[@name='username']" }
    ]
  }
}
```

## Integration (Optional - For Later)

To add healing to SanElement.ts:

```typescript
// In SanElement.findElement()
try {
  return await driver.findElement(this.locator);
} catch (error) {
  if (this.healingConfig?.enabled) {
    const healed = await this.attemptHealing();
    if (healed) return healed;
  }
  throw error;
}
```

## Files

- Core: `src/core/elements/` (HintExtractor, DOMScanner, HealingEngine)
- Config: `src/config/LocatorConfigManager.ts`
- Demo: `demo-app/` (server, HTML forms)
- Test: `tests/login-healing.spec.ts`
- Config: `config/locators.json`

## Verify It Works

Check logs for:
```
Phase 1: Try configured locators
Phase 2: Extract hints
Phase 3: Scan DOM
Phase 4: Validate candidates
Phase 5: Update config
```

That's it. No more documentation.
