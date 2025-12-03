import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * FileWriter - Handles safe file operations for test case insertion
 */
export class FileWriter {
    /**
     * Insert code into test file at specified insertion point
     */
    static insertCodeIntoTestFile(filePath: string, code: string, insertionPoint: number): boolean {
        try {
            // Read existing file
            const content = fs.readFileSync(filePath, 'utf-8');

            // Create backup
            const backupPath = `${filePath}.backup`;
            fs.writeFileSync(backupPath, content);

            // Insert code
            const before = content.substring(0, insertionPoint);
            const after = content.substring(insertionPoint);
            const newContent = before + code + '\n            ' + after;

            // Write updated file
            fs.writeFileSync(filePath, newContent, 'utf-8');

            return true;
        } catch (error) {
            console.error('Error inserting code into test file:', error);
            return false;
        }
    }

    /**
     * Create a new test file from template
     */
    static createTestFile(filePath: string, template: string): boolean {
        try {
            // Create directory if not exists
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Write file
            fs.writeFileSync(filePath, template, 'utf-8');
            return true;
        } catch (error) {
            console.error('Error creating test file:', error);
            return false;
        }
    }

    /**
     * Read test file content
     */
    static readTestFile(filePath: string): string | null {
        try {
            return fs.readFileSync(filePath, 'utf-8');
        } catch (error) {
            console.error('Error reading test file:', error);
            return null;
        }
    }

    /**
     * Get list of test files in directory
     */
    static getTestFiles(directory: string): string[] {
        try {
            const files = fs.readdirSync(directory, { withFileTypes: true });
            return files
                .filter(file => file.isFile() && file.name.endsWith('.spec.ts'))
                .map(file => file.name);
        } catch (error) {
            console.error('Error reading test directory:', error);
            return [];
        }
    }

    /**
     * Restore file from backup
     */
    static restoreFromBackup(filePath: string): boolean {
        try {
            const backupPath = `${filePath}.backup`;
            if (fs.existsSync(backupPath)) {
                const backupContent = fs.readFileSync(backupPath, 'utf-8');
                fs.writeFileSync(filePath, backupContent, 'utf-8');
                fs.unlinkSync(backupPath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error restoring backup:', error);
            return false;
        }
    }

    /**
     * Delete backup file
     */
    static deleteBackup(filePath: string): boolean {
        try {
            const backupPath = `${filePath}.backup`;
            if (fs.existsSync(backupPath)) {
                fs.unlinkSync(backupPath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting backup:', error);
            return false;
        }
    }
}
