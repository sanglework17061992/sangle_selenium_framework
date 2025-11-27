# Self-Healing Test - Implementation Guide

## Overview

When an element locator fails (element not found), the self-healing framework automatically:

1. Tries primary locator + configured fallbacks
2. Extracts hints from all locators
3. Scans DOM and generates alternative candidates
4. Validates candidates to find element
5. Updates config with new primary locator for next run

## Test Flow

### Initial State
Test runs with original element IDs in `demo-app/public/login.html`:
- `id="username-input"` 
- `id="password-input"`
- `id="login-button"`

All tests pass normally.

### Trigger Healing
1. Stop the demo app
2. Edit `demo-app/public/login.html`
3. Change element IDs to:
   - `id="username-input"` → `id="username-field-new"`
   - `id="password-input"` → `id="password-field-new"`
   - `id="login-button"` → `id="login-btn-new"`
4. Start demo app again
5. Run tests

### Healing Process
When test tries to find element with old ID:
- Primary locator fails (id="username-input" not found)
- Fallbacks tried (xpath, css with data-testid)
- All fail, healing triggered
- Healing extracts hints: text, id patterns, class names
- DOM scanned for elements matching hints
- Candidates generated: data-testid, id, xpath, css
- First candidate succeeds: `css="[data-testid='username-field']"`
- Element found and used
- Config updated

### Result
Tests pass again without any code changes. Healing found element via `data-testid` attribute.

## Running Tests

```bash
# Build
npm run build

# Terminal 1: Start demo app
node demo-app/server.js

# Terminal 2: Run tests with healing enabled
export SELF_HEALING_ENABLED=true
export BASE_URL=http://localhost:3000
npm run test:example -- tests/login-healing.spec.ts
```

## Code Files

**Core Healing:**
- `src/core/elements/HintExtractor.ts` - Extracts hints from locators/DOM
- `src/core/elements/DOMScanner.ts` - Scans DOM, generates candidates
- `src/core/elements/HealingEngine.ts` - Orchestrates 5-phase process
- `src/config/LocatorConfigManager.ts` - Manages config persistence
- `src/types/SelfHealingTypes.ts` - TypeScript interfaces

**Demo:**
- `demo-app/server.js` - Express server on port 3000
- `demo-app/public/login.html` - Login form with test IDs
- `src/pages/LoginPage.ts` - Page object for testing
- `tests/login-healing.spec.ts` - Test cases
- `config/locators.json` - Configuration with primary + fallbacks

## Configuration Example

`config/locators.json`:
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

## What Happens in Logs

When healing triggers, logs show:

```
Phase 1: Try configured locators
  Trying id="username-input" ... NOT FOUND
  Trying xpath="//input[@name='username']" ... NOT FOUND

Phase 2: Extract hints
  text: "Username"
  id: "username-input"
  dataAttribute: "username-field"

Phase 3: Scan DOM for candidates
  Found 5 matching elements
  Generated 3 candidate locators

Phase 4: Validate candidates
  Testing css="[data-testid='username-field']" ... FOUND

Phase 5: Update config
  Primary: css="[data-testid='username-field']"
  Fallbacks updated
```

Test continues with element found.

## Next Time

Next test run, config has updated primary:
- Primary tries first: `css="[data-testid='username-field']"` - FOUND immediately
- No healing needed
- Test runs fast (no healing overhead)

## Integration with SanElement (Optional)

To add healing to `SanElement.ts`:

```typescript
async findElement(): Promise<WebElement> {
  try {
    return await this.driver.findElement(this.locator);
  } catch (error) {
    if (this.healingConfig?.enabled && this.healingEngine) {
      const healed = await this.attemptHealing();
      if (healed) return healed;
    }
    throw error;
  }
}
```

That's all. No need to modify tests - healing is transparent.
