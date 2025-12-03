import React from 'react';

interface RightPanelProps {
    url: string;
    isConnected: boolean;
    elementInfo: any;
    onElementDetected: (element: any) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
    url,
    isConnected,
    elementInfo,
    onElementDetected
}) => {
    return (
        <div className="right-panel">
            <div className="panel-section">
                <h3>Browser Preview</h3>
                {isConnected ? (
                    <div className="browser-preview">
                        <iframe src={url} title="Browser Preview" />
                    </div>
                ) : (
                    <div className="connection-error">Not connected to server</div>
                )}
            </div>

            {elementInfo && (
                <div className="panel-section">
                    <h3>Element Info</h3>
                    <div className="element-info">
                        <p><strong>Tag:</strong> {elementInfo.tag}</p>
                        <p><strong>ID:</strong> {elementInfo.id || 'N/A'}</p>
                        <p><strong>Classes:</strong> {elementInfo.classes.join(', ')}</p>
                        <p><strong>Text:</strong> {elementInfo.text}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
