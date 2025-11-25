# Self-Healing Locator Framework - PR #08

## Overview

This PR implements a **self-healing locator framework** for Selenium WebDriver that automatically learns and adapts to UI changes. The framework tracks locator success/failure rates and intelligently falls back to alternative locators when selectors break.

## Problem Solved

Traditional test automation breaks when UI selectors change. This framework solves that by:
- **Learning**: Tracking which locators work best for each element
- **Scoring**: Ranking locators by success rate
- **Healing**: Automatically trying fallback locators when primary ones fail
- **Persistence**: Caching learned locators across test runs
- **Parallel Safety**: Supporting concurrent test execution without race conditions

## Core Components

### 1. **LocatorCache** (`src/core/locators/LocatorCache.ts`)

In-memory cache for tracking locator success/failure with intelligent scoring.

**Key Features:**
- Records success/failure for each locator attempt
- Calculates success rate as: `(successCount / totalAttempts) * 100`
- Ranks locators by score for optimal retry order
- JSON serialization for persistence
- Per-worker isolation for parallel execution

**Usage:**
```typescript
const cache = new LocatorCache();

// Record successful locator use
cache.recordSuccess('login-button', { using: 'id', value: 'submit-btn' });

// Record failed attempt
cache.recordFailure('login-button', { using: 'id', value: 'old-id' });

// Get best locators by score
const best = cache.getByScore('login-button'); // Returns sorted by score

// Get detailed stats
const stats = cache.getScores('login-button');
// [{locator, successCount, failureCount, score, lastUsed}, ...]
```

### 2. **SmartLocatorFinder** (`src/core/locators/SmartLocatorFinder.ts`)

Intelligent element finder with cache-aware fallback and auto-learning.

**Key Features:**
- Tries cached locators first (ordered by learned success rate)
- Falls back to provided alternative locators
- Automatically records success/failure for learning
- Throws detailed error messages showing all attempted locators
- Timeout support for robust element waiting

**Usage:**
```typescript
const finder = new SmartLocatorFinder(driver, cache);

const locators = [
  { using: 'id', value: 'login-button' },
  { using: 'css', value: 'button.login-btn' },
  { using: 'xpath', value: '//button[@id="login"]' }
];

try {
  const element = await finder.find('login_button', locators, 5000);
  await element.click();
} catch (error) {
  console.error('Failed to find element:', error.message);
  // Shows which locators were attempted and why each failed
}
```

### 3. **CacheMergeUtil** (`src/core/locators/CacheMergeUtil.ts`)

Utility for merging per-worker caches after parallel execution.

**Key Features:**
- Loads cache files from all parallel workers
- Intelligently merges locators with combined success/failure counts
- Recalculates scores based on merged data
- Generates master cache for next test run
- Cleans up worker cache files

**Usage:**
```typescript
const merger = new CacheMergeUtil('./.locator-cache');

// After all workers complete:
const masterCache = await merger.merge();
const stats = await merger.loadMaster();
await merger.cleanupWorkerCaches();
```

## How Self-Healing Works

### Single Test Run Flow

```
1. Test starts
   ↓
2. Find element with SmartLocatorFinder
   - Checks cache for learned locators (if any)
   - Tries locators in score order (best first)
   - Falls back to provided alternatives
   ↓
3. Element found and interacted with
   ↓
4. Locator score updated in cache
   - Success: +1 to successCount, recalculate score
   ↓
5. Element not found
   ↓
6. Try next locator from fallback list
   - Failure: +1 to failureCount, recalculate score
   ↓
7. Test ends
   - Cache saved to JSON file
```

### Parallel Execution Flow

```
Test Run N
├── Worker 1 (in-memory cache)
│   └── Learns locators independently
│       └── Dumps cache to worker-1.json on exit
├── Worker 2 (in-memory cache)
│   └── Learns locators independently
│       └── Dumps cache to worker-2.json on exit
├── Worker 3 (in-memory cache)
│   └── Learns locators independently
│       └── Dumps cache to worker-3.json on exit
│
└── Post-Execution Merge
    ├── Load worker-1.json, worker-2.json, worker-3.json
    ├── Merge identical locators
    │   - Combine success/failure counts
    │   - Recalculate scores
    │   - Keep best last-used timestamp
    ├── Save master cache
    └── Clean up worker files

Test Run N+1
└── Uses master cache from Test Run N
    └── Locators tried in learned order (highest score first)
```

### Self-Healing Example

**Step 1: Initial Test (Learning)**
```
App has: <input id="username-field">
Find attempt: id="username-field" ✅ SUCCESS (score: 100)
Find attempt: css="input.username" ✅ SUCCESS (score: 50)
Find attempt: xpath="//input[@type='text']" ✅ SUCCESS (score: 50)
Cache saved: {username: [{id, 100}, {css, 50}, {xpath, 50}]}
```

**Step 2: App Changes (UI Updated)**
```
App now has: <input id="user-input">
Cache ranking: [{id: username-field, 100}, ...]
Find attempt 1: id="username-field" ❌ FAIL (score: 50)
Find attempt 2: css="input.username" ❌ FAIL (score: 25)
Find attempt 3: xpath="//input[@type='text']" ✅ SUCCESS (score: 67)
```

**Step 3: Next Test (Self-Healed)**
```
Same app state: <input id="user-input">
Cache ranking: [{xpath, 67}, {id: username-field, 50}, ...]
Find attempt 1: xpath="//input[@type='text']" ✅ SUCCESS
Test passes automatically!
Cache saved: {username: [{xpath, 80}, {id, 40}, ...]}
```

## Demo Application

Located in `demo-app/` - a simple Express.js server with a login form.

**Features:**
- Dynamic element IDs for testing
- Break/restore selectors via API
- Admin controls in the UI

**Start the demo app:**
```bash
cd demo-app
npm install
npm start
# Server runs on http://localhost:5000
```

**API Endpoints:**
- `POST /api/break-selectors` - Changes element IDs (simulates CSS refactor)
- `POST /api/restore-selectors` - Restores original element IDs
- `GET /api/state` - Returns current state
- `POST /api/reset-cache` - Resets cache

## Test Case

Comprehensive test in `tests/self-healing.spec.ts` demonstrates:

1. **Learning Phase**: Initial login with normal selectors
2. **Self-Healing Phase**: Login with broken selectors and fallback locators
3. **Persistence**: Verification that cache was saved and can be reused
4. **Scoring**: Validation of success/failure tracking

**Run the test:**
```bash
# Start demo app in one terminal
cd demo-app && npm start

# Run test in another terminal
npm test -- --grep "Self-Healing"
```

## Cache File Structure

Master cache stored in `.locator-cache/cache-master.json`:

```json
{
  "version": "1.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "elementLocators": {
    "login_button": [
      {
        "locator": {"using": "id", "value": "login-btn"},
        "successCount": 45,
        "failureCount": 5,
        "score": 90,
        "lastUsed": "2024-01-15T10:29:55Z"
      },
      {
        "locator": {"using": "css", "value": "button.login"},
        "successCount": 30,
        "failureCount": 20,
        "score": 60,
        "lastUsed": "2024-01-15T10:28:00Z"
      }
    ],
    "username_field": [...],
    "password_field": [...]
  }
}
```

Worker cache files in `.locator-cache/cache-worker-*.json` (same structure, per-worker).

## Integration with Existing Framework

The self-healing components integrate seamlessly with the existing Sanium framework:

### SanElement Integration

The framework provides a `findWithFallback` method on `SanElement`:

```typescript
class SanElement {
  async findWithFallback(
    elementId: string,
    locators: Locator[],
    timeout?: number
  ): Promise<WebElement> {
    // Uses SmartLocatorFinder internally
    // Automatically learns and caches
  }
}
```

### BasePage Usage

```typescript
class LoginPage extends BasePage {
  async login(username: string, password: string) {
    // Smart finder tracks these element accesses
    const userField = await this.findWithFallback('username', [
      { using: 'id', value: 'username' },
      { using: 'css', value: '#user-input' }
    ]);
    
    await userField.sendKeys(username);
    
    const pwField = await this.findWithFallback('password', [
      { using: 'id', value: 'password' },
      { using: 'css', value: '#pass-input' }
    ]);
    
    await pwField.sendKeys(password);
    
    const submitBtn = await this.findWithFallback('submit', [
      { using: 'id', value: 'login-button' },
      { using: 'css', value: 'button[type="submit"]' }
    ]);
    
    await submitBtn.click();
  }
}
```

## Configuration

Cache directory can be customized via environment variables:

```bash
export LOCATOR_CACHE_DIR="./.locator-cache"
export CACHE_ENABLED=true
export CACHE_TTL=86400000  # 24 hours in milliseconds
```

## Performance Considerations

- **Memory**: In-memory cache adds minimal overhead (~1KB per learned element)
- **Disk**: Cache files typically <100KB for large test suites
- **Lookup**: Sorting by score is O(n) per find, where n ≈ 3-5 fallback locators
- **Parallel**: No lock contention - each worker has independent in-memory cache

## Future Enhancements

1. **ML Scoring**: Train ML model on historical locator patterns
2. **Element Clustering**: Group similar elements for collective learning
3. **Visual Regression**: Detect UI changes automatically
4. **Remote Caching**: Share cache across machines in distributed testing
5. **Analytics Dashboard**: Monitor self-healing effectiveness

## Troubleshooting

### Cache not being used

```typescript
// Check if cache loaded
const scores = cache.getScores('element-id');
if (scores.length === 0) {
  console.log('No learned locators for this element');
}
```

### All locators failing

```typescript
// SmartLocatorFinder throws with detailed error
const error = await finder.find('element-id', locators).catch(e => e);
console.log('Attempted locators:');
console.log(error.message);
// Shows exactly which locators were tried and why each failed
```

### Cache corruption

```bash
# Clear cache and start fresh
rm -rf .locator-cache/
npm test  # Will rebuild cache
```

## File Structure

```
src/
├── core/
│   └── locators/
│       ├── LocatorCache.ts          # Scoring and in-memory cache
│       ├── SmartLocatorFinder.ts    # Intelligent element finder
│       └── CacheMergeUtil.ts        # Parallel cache merge utility
│
├── core/elements/
│   └── SanElement.ts                # Extended with findWithFallback()
│
└── ... (existing framework files)

tests/
└── self-healing.spec.ts             # Comprehensive self-healing tests

demo-app/
├── server.js                        # Express server with login form
└── package.json                     # Demo app dependencies

.locator-cache/
├── cache-master.json                # Master cache (loaded at test start)
└── cache-worker-*.json              # Per-worker caches (merged post-run)
```

## References

- **Selenium WebDriver**: https://www.selenium.dev/
- **Self-Healing Automation**: https://applitools.com/blog/self-healing-tests/
- **Intelligent Test Locators**: https://github.com/automatedtesting/self-healing

---

**Status**: ✅ Complete and tested with demo application
**PR**: #08
**Branch**: `pr/self-healing`
**Built on**: `pr/07-browser-factory-separation`
