#!/usr/bin/env node

const { configLoader } = require('../dist/src/config/ConfigLoader');
const { spawn } = require('child_process');

// Load test configuration
const testConfig = configLoader.getTestConfig();

// For Selenium tests, we recommend thread-based parallelism
// instead of process-based parallelism
const useThreadParallelism = testConfig.parallel && testConfig.threadCount > 1;

// Build Mocha arguments
const mochaArgs = [
  '-r', 'ts-node/register',
  'tests/**/*.spec.ts',
  '--exit'
];

// Add reporter if --allure flag is passed
if (process.argv.includes('--allure')) {
  mochaArgs.push('--reporter', 'allure-mocha', '--timeout', '60000');
}

// For Selenium tests, use job-based parallelism instead of process parallelism
if (useThreadParallelism) {
  // Use Mocha's job-based parallelism (runs test files in parallel within same process)
  mochaArgs.push('--jobs', testConfig.threadCount.toString());
  console.log(`� Running tests with ${testConfig.threadCount} concurrent jobs (same process)`);
} else {
  // Sequential execution (recommended for Selenium)
  console.log('🔄 Running tests sequentially (recommended for Selenium)');
}

// Spawn Mocha process
const mocha = spawn('mocha', mochaArgs, {
  stdio: 'inherit',
  shell: true
});

mocha.on('close', (code) => {
  process.exit(code);
});

mocha.on('error', (err) => {
  console.error('Failed to start Mocha:', err);
  process.exit(1);
});