import React, { useState, useEffect } from 'react';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { ActionPopup } from './components/ActionPopup';
import './App.css';

interface AppState {
    testName: string;
    url: string;
    testTemplate: string;
    insertionPoint: number;
    capturedCode: string[];
    isConnected: boolean;
    selectedLocator: any;
    showActionPopup: boolean;
    elementInfo: any;
}

export const App: React.FC = () => {
    const [state, setState] = useState<AppState>({
        testName: 'Captured Flow Test',
        url: 'https://example.com',
        testTemplate: '',
        insertionPoint: 0,
        capturedCode: [],
        isConnected: false,
        selectedLocator: null,
        showActionPopup: false,
        elementInfo: null
    });

    const [ws, setWs] = useState<WebSocket | null>(null);

    // Initialize WebSocket connection
    useEffect(() => {
        const websocket = new WebSocket('ws://localhost:3000');

        websocket.onopen = () => {
            console.log('Connected to capture extension server');
            setState(prev => ({ ...prev, isConnected: true }));
        };

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        };

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            setState(prev => ({ ...prev, isConnected: false }));
        };

        websocket.onclose = () => {
            console.log('Disconnected from capture extension server');
            setState(prev => ({ ...prev, isConnected: false }));
        };

        setWs(websocket);

        return () => {
            if (websocket.readyState === WebSocket.OPEN) {
                websocket.close();
            }
        };
    }, []);

    const handleWebSocketMessage = (data: any) => {
        const { type, payload, error } = data;

        switch (type) {
            case 'TEMPLATE_GENERATED':
                setState(prev => ({
                    ...prev,
                    testTemplate: payload.template,
                    insertionPoint: payload.insertionPoint
                }));
                break;
            case 'LOCATORS_GENERATED':
                setState(prev => ({
                    ...prev,
                    selectedLocator: payload.locators[0],
                    showActionPopup: true
                }));
                break;
            case 'ERROR':
                console.error('Server error:', error);
                break;
            default:
                console.log('Unknown message type:', type);
        }
    };

    const generateTemplate = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'GENERATE_TEMPLATE',
                payload: {
                    testName: state.testName,
                    url: state.url
                }
            }));
        }
    };

    const handleActionSelected = (action: string) => {
        // Generate code for the action
        setState(prev => ({
            ...prev,
            capturedCode: [...prev.capturedCode, `// Action: ${action}`],
            showActionPopup: false
        }));
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>🎯 Sangle Capture Tool</h1>
                <div className="status">
                    <span className={`status-dot ${state.isConnected ? 'connected' : 'disconnected'}`}></span>
                    {state.isConnected ? 'Connected' : 'Disconnected'}
                </div>
            </header>

            <div className="app-content">
                <LeftPanel
                    testName={state.testName}
                    testTemplate={state.testTemplate}
                    capturedCode={state.capturedCode}
                    onGenerateTemplate={generateTemplate}
                    onTestNameChange={(name) => setState(prev => ({ ...prev, testName: name }))}
                    onUrlChange={(url) => setState(prev => ({ ...prev, url }))}
                />

                <RightPanel
                    url={state.url}
                    isConnected={state.isConnected}
                    elementInfo={state.elementInfo}
                    onElementDetected={(element) => setState(prev => ({ ...prev, elementInfo: element }))}
                />
            </div>

            {state.showActionPopup && state.selectedLocator && (
                <ActionPopup
                    locator={state.selectedLocator}
                    onActionSelected={handleActionSelected}
                    onClose={() => setState(prev => ({ ...prev, showActionPopup: false }))}
                />
            )}
        </div>
    );
};

export default App;
