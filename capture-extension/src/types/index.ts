/**
 * Type definitions for Capture Tool
 */

export interface ElementInfo {
    tag: string;
    id?: string;
    classes: string[];
    attributes: Record<string, string>;
    text: string;
    xpath: string;
    css: string;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export interface LocatorOption {
    type: 'css' | 'xpath' | 'id' | 'smartXpath';
    value: string;
    confidence: number; // 0-100
    description: string;
}

export interface CapturedAction {
    id: string;
    timestamp: number;
    locator: LocatorOption;
    actionType: ActionType;
    parameters?: Record<string, any>;
    assertion?: AssertionType;
}

export type ActionType = 'click' | 'type' | 'check' | 'uncheck' | 'select' | 'hover' | 'scroll' | 'submit' | 'getText' | 'clear' | 'focus';

export type AssertionType = 'toBeVisible' | 'toBeHidden' | 'toBeEnabled' | 'toBeDisabled' | 'toContain' | 'toEqual';

export interface TestTemplate {
    testName: string;
    url: string;
    template: string;
    insertionPoint: number;
}

export interface GeneratedCode {
    action: string;
    logger: string;
    fullCode: string;
}

export interface TestExecutionResult {
    success: boolean;
    output: string;
    error?: string;
    screenshot?: string;
}
