import type { CapturedAction, GeneratedCode } from '../types/index';
import { FileWriter } from './FileWriter';
import { CodeGenerator } from './CodeGenerator';
import { TestRunner } from './TestRunner';

/**
 * ActionHandler - Manages Insert and Insert & Run workflows
 */
export class ActionHandler {
    /**
     * Handle Insert Only - Write code to test file without execution
     */
    static async handleInsertOnly(testFilePath: string, code: string, insertionPoint: number): Promise<boolean> {
        try {
            const success = FileWriter.insertCodeIntoTestFile(testFilePath, code, insertionPoint);
            if (success) {
                console.log('Code inserted successfully into test file');
                // Delete backup after successful insertion
                FileWriter.deleteBackup(testFilePath);
            }
            return success;
        } catch (error) {
            console.error('Error in handleInsertOnly:', error);
            return false;
        }
    }

    /**
     * Handle Insert & Run - Write code and execute the action
     */
    static async handleInsertAndRun(
        testFilePath: string,
        code: string,
        insertionPoint: number,
        testName: string
    ): Promise<{ success: boolean; output: string; error?: string }> {
        try {
            // Insert code into file
            const insertSuccess = FileWriter.insertCodeIntoTestFile(testFilePath, code, insertionPoint);
            if (!insertSuccess) {
                return {
                    success: false,
                    output: '',
                    error: 'Failed to insert code into test file'
                };
            }

            // Execute the test
            const testResult = await TestRunner.runTest(testFilePath, testName);

            if (testResult.success) {
                // Keep inserted code and delete backup
                FileWriter.deleteBackup(testFilePath);
                return {
                    success: true,
                    output: testResult.output
                };
            } else {
                // Restore from backup if test failed
                const restored = FileWriter.restoreFromBackup(testFilePath);
                return {
                    success: false,
                    output: testResult.output,
                    error: `Test execution failed${restored ? '. File restored from backup' : ''}`
                };
            }
        } catch (error) {
            console.error('Error in handleInsertAndRun:', error);
            // Try to restore from backup
            FileWriter.restoreFromBackup(testFilePath);
            return {
                success: false,
                output: '',
                error: String(error)
            };
        }
    }

    /**
     * Validate action before execution
     */
    static validateAction(action: CapturedAction): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!action.locator || !action.locator.value) {
            errors.push('Invalid locator');
        }

        if (!action.actionType) {
            errors.push('Action type not specified');
        }

        if (action.actionType === 'type' && !action.parameters?.text) {
            errors.push('Text parameter missing for type action');
        }

        if (action.actionType === 'select' && !action.parameters?.value) {
            errors.push('Value parameter missing for select action');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Generate and validate code before insertion
     */
    static generateAndValidateCode(
        action: CapturedAction
    ): { success: boolean; code?: string; error?: string } {
        // Validate action
        const validation = this.validateAction(action);
        if (!validation.valid) {
            return {
                success: false,
                error: `Validation failed: ${validation.errors.join(', ')}`
            };
        }

        try {
            // Generate code
            let generatedCode: GeneratedCode;

            if (action.assertion) {
                generatedCode = CodeGenerator.generateAssertionCode(
                    action.locator,
                    action.assertion,
                    action.parameters
                );
            } else {
                generatedCode = CodeGenerator.generateActionCode(
                    action.locator,
                    action.actionType,
                    action.parameters
                );
            }

            return {
                success: true,
                code: generatedCode.fullCode
            };
        } catch (error) {
            return {
                success: false,
                error: `Code generation failed: ${String(error)}`
            };
        }
    }
}
