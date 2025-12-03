import express from 'express';
import { WebSocketServer } from 'ws';
import * as http from 'node:http';
import { TemplateGenerator } from './services/TemplateGenerator';
import { LocatorCapture } from './services/LocatorCapture';
import { CodeGenerator } from './services/CodeGenerator';
import { ActionHandler } from './services/ActionHandler';
import { FileWriter } from './services/FileWriter';

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static('dist'));
app.use(express.static('public'));

// Create HTTP server for WebSocket
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');

    ws.on('message', (message: string) => {
        try {
            const data = JSON.parse(message);
            handleWebSocketMessage(data, ws);
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected from WebSocket');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

/**
 * Handle WebSocket messages
 */
function handleWebSocketMessage(data: any, ws: any): void {
    const { type, payload } = data;

    switch (type) {
        case 'GENERATE_TEMPLATE':
            handleGenerateTemplate(payload, ws);
            break;
        case 'GENERATE_LOCATORS':
            handleGenerateLocators(payload, ws);
            break;
        case 'GENERATE_CODE':
            handleGenerateCode(payload, ws);
            break;
        case 'INSERT_CODE':
            handleInsertCode(payload, ws);
            break;
        case 'INSERT_AND_RUN':
            handleInsertAndRun(payload, ws);
            break;
        default:
            ws.send(JSON.stringify({ error: 'Unknown message type' }));
    }
}

/**
 * Handle generate template request
 */
function handleGenerateTemplate(payload: any, ws: any): void {
    try {
        const { testName, url } = payload;
        const template = TemplateGenerator.generateTemplate(testName, url);
        ws.send(JSON.stringify({
            type: 'TEMPLATE_GENERATED',
            payload: template
        }));
    } catch (error) {
        ws.send(JSON.stringify({
            type: 'ERROR',
            error: String(error)
        }));
    }
}

/**
 * Handle generate locators request
 */
function handleGenerateLocators(payload: any, ws: any): void {
    try {
        const { elementInfo } = payload;
        const locators = LocatorCapture.generateLocators(elementInfo);
        ws.send(JSON.stringify({
            type: 'LOCATORS_GENERATED',
            payload: { locators }
        }));
    } catch (error) {
        ws.send(JSON.stringify({
            type: 'ERROR',
            error: String(error)
        }));
    }
}

/**
 * Handle generate code request
 */
function handleGenerateCode(payload: any, ws: any): void {
    try {
        const { locator, actionType, parameters, assertion } = payload;

        let code;
        if (assertion) {
            code = CodeGenerator.generateAssertionCode(locator, assertion, parameters);
        } else {
            code = CodeGenerator.generateActionCode(locator, actionType, parameters);
        }

        ws.send(JSON.stringify({
            type: 'CODE_GENERATED',
            payload: code
        }));
    } catch (error) {
        ws.send(JSON.stringify({
            type: 'ERROR',
            error: String(error)
        }));
    }
}

/**
 * Handle insert code request
 */
async function handleInsertCode(payload: any, ws: any): Promise<void> {
    try {
        const { testFilePath, code, insertionPoint } = payload;
        const success = await ActionHandler.handleInsertOnly(testFilePath, code, insertionPoint);

        ws.send(JSON.stringify({
            type: 'CODE_INSERTED',
            payload: { success }
        }));
    } catch (error) {
        ws.send(JSON.stringify({
            type: 'ERROR',
            error: String(error)
        }));
    }
}

/**
 * Handle insert and run request
 */
async function handleInsertAndRun(payload: any, ws: any): Promise<void> {
    try {
        const { testFilePath, code, insertionPoint, testName } = payload;
        const result = await ActionHandler.handleInsertAndRun(testFilePath, code, insertionPoint, testName);

        ws.send(JSON.stringify({
            type: 'INSERT_AND_RUN_COMPLETE',
            payload: result
        }));
    } catch (error) {
        ws.send(JSON.stringify({
            type: 'ERROR',
            error: String(error)
        }));
    }
}

// REST API endpoints

/**
 * Get list of test files
 */
app.get('/api/tests', (req, res) => {
    try {
        const testDir = process.env.TEST_DIR || '../tests';
        const files = FileWriter.getTestFiles(testDir);
        res.json({ success: true, files });
    } catch (error) {
        res.status(500).json({ success: false, error: String(error) });
    }
});

/**
 * Get test file content
 */
app.get('/api/tests/:filename', (req, res) => {
    try {
        const testDir = process.env.TEST_DIR || '../tests';
        const filePath = `${testDir}/${req.params.filename}`;
        const content = FileWriter.readTestFile(filePath);

        if (content) {
            res.json({ success: true, content });
        } else {
            res.status(404).json({ success: false, error: 'File not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: String(error) });
    }
});

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Capture extension server is running' });
});

// Start server
server.listen(port, () => {
    console.log(`Capture extension server running on http://localhost:${port}`);
});
