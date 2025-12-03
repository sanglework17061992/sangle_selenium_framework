import { execSync } from 'node:child_process';
import type { TestExecutionResult } from '../types/index';

/**
 * TestRunner - Executes tests and captures output
 */
export class TestRunner {
    /**
     * Run a specific test file
     */
    static async runTest(testFilePath: string, testName?: string): Promise<TestExecutionResult> {
        try {
            // Build command - can run specific test or all tests in file
            let command = 'npm test';
            if (testName) {
                command += ` -- --grep "${testName}"`;
            }

            // Execute test and capture output
            const output = execSync(command, {
                cwd: process.cwd(),
                encoding: 'utf-8'
            });

            return {
                success: true,
                output
            };
        } catch (error: unknown) {
            // Test failed - capture error output
            const errorOutput = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                output: '',
                error: errorOutput
            };
        }
    }

    /**
     * Run all tests
     */
    static async runAllTests(): Promise<TestExecutionResult> {
        try {
            const output = execSync('npm test', {
                cwd: process.cwd(),
                encoding: 'utf-8'
            });

            return {
                success: true,
                output
            };
        } catch (error: unknown) {
            const errorOutput = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                output: '',
                error: errorOutput
            };
        }
    }

    /**
     * Get test execution status
     */
    static getTestStatus(output: string): 'passed' | 'failed' | 'unknown' {
        if (output.includes('passing')) {
            return 'passed';
        } else if (output.includes('failing')) {
            return 'failed';
        }
        return 'unknown';
    }
}
