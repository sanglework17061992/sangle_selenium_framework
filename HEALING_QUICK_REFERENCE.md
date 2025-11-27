# Self-Healing - Quick Reference Card

## Test in 5 Minutes

```bash
# Terminal 1
node demo-app/server.js

# Terminal 2
npm run build
export SELF_HEALING_ENABLED=true
npm run test:example -- tests/login-healing.spec.ts
```

Expected: 8 tests pass.

## Trigger Healing

1. Edit `demo-app/public/login.html`
2. Change:
   - `id="username-input"` to `id="username-field-new"`
   - `id="password-input"` to `id="password-field-new"`
   - `id="login-button"` to `id="login-btn-new"`
3. Run tests again → Still pass!

## The 5 Phases

| Phase | What It Does | Example |
|-------|--------------|---------|
| 1 | Try primary + fallback locators | id="username-input" not found |
| 2 | Extract hints from all locators | text="Username", dataAttr="username-field" |
| 3 | Scan DOM for matching elements | Found 5 inputs with username semantics |
| 4 | Validate candidates | css="[data-testid='username-field']" WORKS |
| 5 | Update config | Save new primary for next run |

## Config Structure

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

## Files to Know

| File | Purpose |
|------|---------|
| `src/core/elements/HintExtractor.ts` | Extract hints |
| `src/core/elements/DOMScanner.ts` | Scan DOM |
| `src/core/elements/HealingEngine.ts` | Orchestrate |
| `src/config/LocatorConfigManager.ts` | Persist config |
| `demo-app/server.js` | Test server |
| `tests/login-healing.spec.ts` | Test cases |
| `config/locators.json` | Configuration |

## What Happens in Logs

```
Phase 1: Try configured locators
  id="username-input" NOT FOUND
  xpath="//input[@name='username']" NOT FOUND

Phase 2: Extract hints
  text = "Username"
  id = "username-input"
  dataAttr = "username-field"

Phase 3: Scan DOM for candidates
  Found 5 matching elements
  Generated 3 candidates

Phase 4: Validate candidates
  css="[data-testid='username-field']" FOUND

Phase 5: Update config
  primary = css="[data-testid='username-field']"
```

## Enable Healing

```bash
export SELF_HEALING_ENABLED=true
```

Disable: Remove or set to false.

## Next Test Run

Config now has:
```json
{
  "primary": { "using": "css", "value": "[data-testid='username-field']" },
  "fallbacks": [
    { "using": "id", "value": "username-input" },
    ...
  ]
}
```

Primary works first → No healing needed → Fast!

## Verify It Works

Look for log messages:
- "Phase 1: Try configured locators"
- "Phase 2: Extract hints"
- "Phase 3: Scan DOM for candidates"
- "Phase 4: Validate candidates"
- "Phase 5: Update config"

If all 5 phases run, healing succeeded!

## Integration (Optional)

Add to `SanElement.findElement()`:

```typescript
try {
  return await this.driver.findElement(this.locator);
} catch (error) {
  if (this.healingConfig?.enabled) {
    return await this.attemptHealing();
  }
  throw error;
}
```

That's it. Tests don't change.
