import React from 'react';

interface ActionPopupProps {
    locator: any;
    onActionSelected: (action: string) => void;
    onClose: () => void;
}

export const ActionPopup: React.FC<ActionPopupProps> = ({
    locator,
    onActionSelected,
    onClose
}) => {
    const actions = [
        'click',
        'type',
        'hover',
        'focus',
        'clear',
        'submit'
    ];

    const assertions = [
        'toBeVisible',
        'toBeHidden',
        'toBeEnabled',
        'toBeDisabled'
    ];

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <h3>Select Action</h3>
                
                <div className="popup-section">
                    <h4>Actions</h4>
                    {actions.map((action) => (
                        <button
                            key={action}
                            onClick={() => {
                                onActionSelected(action);
                                onClose();
                            }}
                            className="action-button"
                        >
                            {action}
                        </button>
                    ))}
                </div>

                <div className="popup-section">
                    <h4>Assertions</h4>
                    {assertions.map((assertion) => (
                        <button
                            key={assertion}
                            onClick={() => {
                                onActionSelected(assertion);
                                onClose();
                            }}
                            className="assertion-button"
                        >
                            {assertion}
                        </button>
                    ))}
                </div>

                <button onClick={onClose} className="close-button">Close</button>
            </div>
        </div>
    );
};
