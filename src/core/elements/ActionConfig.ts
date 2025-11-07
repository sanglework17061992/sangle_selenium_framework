import { ActionabilityOptions } from './ActionabilityChecker';
import { ActionType } from './ActionType';

/**
 * Action requirements matrix based on Playwright's actionability checks
 * Reference: https://playwright.dev/docs/actionability
 */
export const ACTION_REQUIREMENTS: Record<ActionType, ActionabilityOptions> = {
  // Interactive click-like actions - require all checks
  [ActionType.CLICK]: {
    visible: true,
    stable: true,
    receivesEvents: true,
    enabled: true,
  },
  
  [ActionType.DOUBLE_CLICK]: {
    visible: true,
    stable: true,
    receivesEvents: true,
    enabled: true,
  },
  
  [ActionType.RIGHT_CLICK]: {
    visible: true,
    stable: true,
    receivesEvents: true,
    enabled: true,
  },
  
  [ActionType.CHECK]: {
    visible: true,
    stable: true,
    receivesEvents: true,
    enabled: true,
  },
  
  [ActionType.UNCHECK]: {
    visible: true,
    stable: true,
    receivesEvents: true,
    enabled: true,
  },
  
  // Hover actions - no enabled check
  [ActionType.HOVER]: {
    visible: true,
    stable: true,
    receivesEvents: true,
  },
  
  [ActionType.DRAG]: {
    visible: true,
    stable: true,
    receivesEvents: true,
  },
  
  // Input/fill actions - require editability
  [ActionType.CLEAR]: {
    visible: true,
    enabled: true,
    editable: true,
  },
  
  [ActionType.TYPE]: {
    visible: true,
    enabled: true,
    editable: true,
  },
  
  // Select actions - require enabled but not editable
  [ActionType.SELECT]: {
    visible: true,
    enabled: true,
  },
  
  [ActionType.FOCUS]: {
    visible: true,
  },
};

/**
 * Get actionability requirements for a specific action
 */
export function getActionRequirements(actionType: ActionType): ActionabilityOptions {
  return ACTION_REQUIREMENTS[actionType] || {};
}
