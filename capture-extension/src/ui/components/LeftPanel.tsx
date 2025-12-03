import React from 'react';

interface LeftPanelProps {
    testName: string;
    testTemplate: string;
    capturedCode: string[];
    onGenerateTemplate: () => void;
    onTestNameChange: (name: string) => void;
    onUrlChange: (url: string) => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
    testName,
    testTemplate,
    capturedCode,
    onGenerateTemplate,
    onTestNameChange,
    onUrlChange
}) => {
    return (
        <div className="left-panel">
            <div className="panel-section">
                <h3>Test Configuration</h3>
                <input
                    type="text"
                    placeholder="Test Name"
                    value={testName}
                    onChange={(e) => onTestNameChange(e.target.value)}
                />
                <button onClick={onGenerateTemplate}>Generate Template</button>
            </div>

            <div className="panel-section">
                <h3>Captured Code</h3>
                <pre>{testTemplate}</pre>
                {capturedCode.map((code, index) => (
                    <div key={index} className="code-item">{code}</div>
                ))}
            </div>
        </div>
    );
};
