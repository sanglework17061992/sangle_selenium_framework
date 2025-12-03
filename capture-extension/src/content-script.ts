/**
 * Content Script - Injected into browser for element detection and hover tracking
 */

interface ElementData {
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

let highlightedElement: Element | null = null;
let highlightOverlay: HTMLElement | null = null;

/**
 * Generate XPath for element
 */
function getXPath(element: Element): string {
    if (element.id !== '') {
        return `//*[@id="${element.id}"]`;
    }

    if (element === document.body) {
        return '/html/body';
    }

    const ix = Array.from(element.parentElement?.children || []).indexOf(element as Element) + 1;
    const tag = element.tagName.toLowerCase();
    const parentPath = getXPath(element.parentElement as Element);

    return `${parentPath}/${tag}[${ix}]`;
}

/**
 * Generate CSS selector for element
 */
function getCSSSelector(element: Element): string {
    if (element.id) {
        return `#${element.id}`;
    }

    let path: string[] = [];
    while (element.parentElement) {
        let selector = element.tagName.toLowerCase();

        if (element.id) {
            selector += `#${element.id}`;
        } else {
            const siblings = Array.from(element.parentElement.children);
            const index = siblings.indexOf(element as Element);
            const sameTagSiblings = siblings.filter(
                (el) => el.tagName.toLowerCase() === element.tagName.toLowerCase()
            );

            if (sameTagSiblings.length > 1) {
                selector += `:nth-of-type(${index + 1})`;
            }
        }

        path.unshift(selector);
        element = element.parentElement;
    }

    return path.join(' > ');
}

/**
 * Extract element data
 */
function extractElementData(element: Element): ElementData {
    const rect = element.getBoundingClientRect();
    const attributes: Record<string, string> = {};

    // Extract all attributes
    for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        attributes[attr.name] = attr.value;
    }

    return {
        tag: element.tagName.toLowerCase(),
        id: element.id || undefined,
        classes: Array.from(element.classList),
        attributes,
        text: element.textContent?.trim().substring(0, 100) || '',
        xpath: getXPath(element),
        css: getCSSSelector(element),
        position: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
        }
    };
}

/**
 * Create and show highlight overlay
 */
function createHighlight(element: Element): void {
    if (highlightOverlay) {
        highlightOverlay.remove();
    }

    const rect = element.getBoundingClientRect();
    const overlay = document.createElement('div');

    overlay.style.position = 'fixed';
    overlay.style.top = `${rect.top + window.scrollY}px`;
    overlay.style.left = `${rect.left + window.scrollX}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.border = '2px solid #4CAF50';
    overlay.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '10000';
    overlay.style.boxShadow = '0 0 5px rgba(76, 175, 80, 0.5)';

    // Add label
    const label = document.createElement('div');
    label.textContent = `${element.tagName.toLowerCase()}`;
    label.style.position = 'absolute';
    label.style.top = '-25px';
    label.style.left = '0';
    label.style.backgroundColor = '#4CAF50';
    label.style.color = 'white';
    label.style.padding = '2px 6px';
    label.style.fontSize = '12px';
    label.style.borderRadius = '3px';
    label.style.fontFamily = 'monospace';

    overlay.appendChild(label);
    document.body.appendChild(overlay);
    highlightOverlay = overlay;
}

/**
 * Remove highlight
 */
function removeHighlight(): void {
    if (highlightOverlay && document.body.contains(highlightOverlay)) {
        highlightOverlay.remove();
        highlightOverlay = null;
    }
    highlightedElement = null;
}

/**
 * Send element data to parent window (for WebSocket communication)
 */
function sendElementData(element: Element, action: string): void {
    const elementData = extractElementData(element);
    window.parent.postMessage({
        type: 'ELEMENT_DETECTED',
        action,
        elementData
    }, '*');
}

/**
 * Handle hover events
 */
document.addEventListener('mouseover', (event) => {
    const element = event.target as Element;

    // Skip if hovering over overlay or body/html
    if (
        !element ||
        highlightOverlay?.contains(element) ||
        element.tagName.toLowerCase() === 'body' ||
        element.tagName.toLowerCase() === 'html'
    ) {
        return;
    }

    highlightedElement = element;
    createHighlight(element);
    sendElementData(element, 'hover');
});

/**
 * Handle mouse leave
 */
document.addEventListener('mouseout', () => {
    removeHighlight();
});

/**
 * Handle right-click to show action menu
 */
document.addEventListener('contextmenu', (event) => {
    const element = event.target as Element;

    if (!element || highlightOverlay?.contains(element)) {
        return;
    }

    event.preventDefault();
    sendElementData(element, 'rightclick');
});

/**
 * Handle left-click to select element
 */
document.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        const element = event.target as Element;
        if (element && !highlightOverlay?.contains(element)) {
            sendElementData(element, 'click');
        }
    }
}, true);

console.log('Content script loaded for capture tool');
