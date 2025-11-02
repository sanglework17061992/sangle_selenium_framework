// CSS Styles Module
// Comprehensive CSS styles for the Smart Locator Inspector UI

export class SLIStyles {
    static getCSS() {
        return `
            .sli-modal { 
                position: fixed !important; 
                top: 20px !important; 
                right: 20px !important; 
                width: 440px !important; 
                max-height: 85vh !important; 
                background: rgba(28, 28, 30, 0.95) !important; 
                border: 2px solid #007acc !important; 
                border-radius: 12px !important; 
                color: white !important; 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; 
                font-size: 13px !important; 
                z-index: 2147483647 !important; 
                box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) !important; 
                backdrop-filter: blur(5px) !important; 
                overflow: hidden !important; 
                pointer-events: auto !important; 
                user-select: none !important; 
                transform: translateZ(0) !important; 
            }
            
            .sli-header { 
                background: linear-gradient(135deg, #007acc 0%, #005a9e 100%) !important; 
                padding: 12px 16px !important; 
                display: flex !important; 
                justify-content: space-between !important; 
                align-items: center !important; 
                font-weight: 600 !important; 
                cursor: move !important; 
                border-radius: 10px 10px 0 0 !important; 
            }
            
            .sli-title { 
                color: white !important; 
                font-size: 15px !important; 
                font-weight: 600 !important; 
            }
            
            .sli-close { 
                background: rgba(255, 255, 255, 0.1) !important; 
                border: 1px solid rgba(255, 255, 255, 0.2) !important; 
                color: white !important; 
                font-size: 16px !important; 
                cursor: pointer !important; 
                padding: 4px 8px !important; 
                width: 28px !important; 
                height: 28px !important; 
                border-radius: 6px !important; 
                display: flex !important; 
                align-items: center !important; 
                justify-content: center !important; 
                transition: all 0.2s ease !important; 
            }
            
            .sli-close:hover { 
                background: rgba(255, 255, 255, 0.2) !important; 
                border-color: rgba(255, 255, 255, 0.4) !important; 
                transform: scale(1.1) !important; 
            }
            
            .sli-content { 
                padding: 16px !important; 
                max-height: calc(85vh - 60px) !important; 
                overflow-y: auto !important; 
            }
            
            .sli-content::-webkit-scrollbar { 
                width: 6px !important; 
            }
            
            .sli-content::-webkit-scrollbar-track { 
                background: rgba(255, 255, 255, 0.1) !important; 
                border-radius: 3px !important; 
            }
            
            .sli-content::-webkit-scrollbar-thumb { 
                background: rgba(255, 255, 255, 0.3) !important; 
                border-radius: 3px !important; 
            }
            
            .sli-field { 
                margin-bottom: 10px !important; 
                padding: 10px 12px !important; 
                background: rgba(255, 255, 255, 0.08) !important; 
                border: 1px solid rgba(255, 255, 255, 0.15) !important; 
                border-radius: 8px !important; 
                cursor: pointer !important; 
                transition: all 0.2s ease !important; 
                position: relative !important; 
            }
            
            .sli-field:hover { 
                background: rgba(0, 122, 204, 0.2) !important; 
                border-color: #007acc !important; 
                transform: translateY(-1px) !important; 
            }
            
            .sli-smart-xpath { 
                border-left: 4px solid #61dafb !important; 
            }
            
            .sli-smart-xpath:hover { 
                border-left-color: #007acc !important; 
            }
            
            .sli-table-xpath { 
                border-left: 4px solid #ff9500 !important; 
                background: rgba(255, 149, 0, 0.05) !important; 
            }
            
            .sli-table-xpath:hover { 
                border-left-color: #ff7700 !important; 
                background: rgba(255, 149, 0, 0.15) !important; 
            }
            
            .sli-playwright-xpath { 
                border-left: 4px solid #2D8659 !important; 
                background: rgba(45, 134, 89, 0.08) !important; 
            }
            
            .sli-playwright-xpath:hover { 
                border-left-color: #228B22 !important; 
                background: rgba(45, 134, 89, 0.18) !important; 
            }
            
            .sli-playwright-xpath .sli-field-label {
                color: #2D8659 !important;
            }
            
            .sli-unique { 
                border-left-color: #98c379 !important; 
            }
            
            .sli-unique:hover { 
                border-left-color: #27ae60 !important; 
            }
            
            .sli-non-unique { 
                border-left-color: #e5c07b !important; 
            }
            
            .sli-non-unique:hover { 
                border-left-color: #f39c12 !important; 
            }
            
            .sli-field-header { 
                display: flex !important; 
                justify-content: space-between !important; 
                align-items: flex-start !important; 
                margin-bottom: 6px !important; 
            }
            
            .sli-field-label { 
                color: #61dafb !important; 
                font-weight: 600 !important; 
                font-size: 12px !important; 
                text-transform: uppercase !important; 
                letter-spacing: 0.5px !important; 
                flex: 1 !important; 
            }
            
            .sli-score-container { 
                display: flex !important; 
                flex-direction: column !important; 
                align-items: flex-end !important; 
                min-width: 90px !important; 
            }
            
            .sli-uniqueness { 
                font-weight: 600 !important; 
                font-size: 10px !important; 
                margin-bottom: 2px !important; 
                text-transform: uppercase !important; 
            }
            
            .sli-score { 
                font-weight: 700 !important; 
                font-size: 11px !important; 
                margin-bottom: 2px !important; 
            }
            
            .sli-score-bar { 
                font-family: monospace !important; 
                font-size: 8px !important; 
                line-height: 1 !important; 
                opacity: 0.7 !important; 
            }
            
            .sli-field-description { 
                color: #98c379 !important; 
                font-size: 11px !important; 
                font-style: italic !important; 
                margin-bottom: 6px !important; 
                opacity: 0.9 !important; 
            }
            
            .sli-field-value { 
                color: #f8f8f2 !important; 
                word-break: break-all !important; 
                font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace !important; 
                font-size: 11px !important; 
                line-height: 1.4 !important; 
                background: rgba(0, 0, 0, 0.2) !important; 
                padding: 6px 8px !important; 
                border-radius: 4px !important; 
            }
            
            .sli-xpath-header { 
                color: #e5c07b !important; 
                font-weight: 700 !important; 
                font-size: 13px !important; 
                margin: 16px 0 8px 0 !important; 
                padding: 8px 12px !important; 
                background: rgba(229, 192, 123, 0.1) !important; 
                border-radius: 6px !important; 
                border-left: 4px solid #e5c07b !important; 
            }
            
            .sli-instruction { 
                color: #98c379 !important; 
                font-size: 11px !important; 
                margin-bottom: 6px !important; 
                padding: 4px 8px !important; 
                background: rgba(152, 195, 121, 0.1) !important; 
                border-radius: 4px !important; 
                border-left: 3px solid #98c379 !important; 
            }
            
            .sli-message { 
                color: #61dafb !important; 
                font-weight: 600 !important; 
                text-align: center !important; 
                padding: 16px !important; 
                font-size: 14px !important; 
            }
            
            .sli-loading { 
                color: #98c379 !important; 
                text-align: center !important; 
                padding: 24px !important; 
                font-style: italic !important; 
                font-size: 14px !important; 
            }
            
            .sli-frozen { 
                border-color: #e06c75 !important; 
                box-shadow: 0 0 20px rgba(224, 108, 117, 0.4) !important; 
            }
            
            .sli-frozen .sli-header { 
                background: linear-gradient(135deg, #e06c75 0%, #c94a4a 100%) !important; 
            }
            
            .sli-highlight { 
                position: fixed !important; 
                top: 0 !important; 
                left: 0 !important; 
                width: 0 !important; 
                height: 0 !important; 
                pointer-events: none !important; 
                z-index: 999999999 !important; 
                border: 2px solid #007acc !important; 
                background: rgba(0, 122, 204, 0.15) !important; 
                box-shadow: 0 0 0 1px rgba(0, 122, 204, 0.3), inset 0 0 0 1px rgba(0, 122, 204, 0.3) !important; 
                display: none !important; 
                opacity: 1 !important; 
                border-radius: 2px !important; 
                transition: all 0.1s ease !important;
            }
            
            .sli-highlight.frozen { 
                border: 2px solid #00FF00 !important; 
                background: rgba(0, 255, 0, 0.15) !important; 
                box-shadow: 0 0 0 1px rgba(0, 255, 0, 0.3), inset 0 0 0 1px rgba(0, 255, 0, 0.3) !important; 
                animation: sli-pulse 1.5s infinite !important;
            }
            
            @keyframes sli-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            .sli-element-info {
                position: fixed !important;
                background: rgba(0, 0, 0, 0.85) !important;
                color: white !important;
                padding: 6px 10px !important;
                border-radius: 4px !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace !important;
                font-size: 11px !important;
                font-weight: normal !important;
                line-height: 1.4 !important;
                z-index: 1000000000 !important;
                pointer-events: none !important;
                white-space: nowrap !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                max-width: 300px !important;
                word-break: break-all !important;
                opacity: 1 !important;
                display: none !important;
            }
            
            .sli-element-info .tag {
                color: #569cd6 !important;
                font-weight: bold !important;
            }
            
            .sli-element-info .attr {
                color: #9cdcfe !important;
            }
            
            .sli-element-info .value {
                color: #ce9178 !important;
            }
            
            .sli-element-info .size {
                color: #d4d4d4 !important;
                margin-left: 8px !important;
            }
            
            .sli-hierarchy-container { 
                margin-top: 16px !important; 
                padding: 12px !important; 
                background: rgba(255, 255, 255, 0.05) !important; 
                border: 1px solid rgba(255, 255, 255, 0.1) !important; 
                border-radius: 8px !important; 
                border-left: 4px solid #c678dd !important; 
            }
            
            .sli-hierarchy-header { 
                color: #c678dd !important; 
                font-weight: 700 !important; 
                font-size: 13px !important; 
                margin-bottom: 12px !important; 
                padding: 8px 12px !important; 
                background: rgba(198, 120, 221, 0.1) !important; 
                border-radius: 6px !important; 
                display: flex !important; 
                align-items: center !important; 
            }
            
            .sli-hierarchy-tree { 
                font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace !important; 
                font-size: 11px !important; 
                line-height: 1.6 !important; 
            }
            
            .sli-hierarchy-item { 
                padding: 2px 8px !important; 
                margin-bottom: 1px !important; 
                background: rgba(0, 0, 0, 0.1) !important; 
                border-radius: 3px !important; 
                cursor: pointer !important; 
                transition: all 0.2s ease !important; 
                position: relative !important; 
                white-space: pre !important; 
                overflow-x: auto !important; 
            }
            
            .sli-hierarchy-item:hover { 
                background: rgba(0, 122, 204, 0.2) !important; 
                transform: translateX(2px) !important; 
            }
            
            .sli-hierarchy-item.current { 
                background: rgba(152, 195, 121, 0.2) !important; 
                border: 1px solid #98c379 !important; 
                font-weight: 600 !important; 
                color: #98c379 !important; 
            }
            
            .sli-tree-line { 
                color: #f8f8f2 !important; 
            }
            
            .sli-hierarchy-item.current .sli-tree-line { 
                color: #98c379 !important; 
            }
            
            .sli-hierarchy-highlight { 
                border: 2px solid #c678dd !important; 
                background: rgba(198, 120, 221, 0.3) !important; 
                box-shadow: 0 0 12px rgba(198, 120, 221, 0.6) !important; 
            }
        `;
    }

    static injectStyles() {
        let styleSheet = document.getElementById('sli-styles');
        if (styleSheet) {
            styleSheet.remove();
        }
        
        styleSheet = document.createElement('style');
        styleSheet.id = 'sli-styles';
        styleSheet.textContent = this.getCSS();

        document.head.appendChild(styleSheet);
    }
}