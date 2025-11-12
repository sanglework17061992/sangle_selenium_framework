import { ActionabilityOptions, CheckName } from './ActionabilityChecker';
import { ActionType } from '../../types/Enums';

// Reusable check combinations - define which checks are needed for each action type
const INTERACTIVE_CHECKS: readonly CheckName[] = ['visible', 'stable', 'receivesEvents', 'enabled'];
const HOVER_CHECKS: readonly CheckName[] = ['visible', 'stable', 'receivesEvents'];
const EDITABLE_CHECKS: readonly CheckName[] = ['visible', 'enabled', 'editable'];

/**
 * Action requirements matrix based on Playwright's actionability checks
 * Reference: https://playwright.dev/docs/actionability
 */
export const ACTION_REQUIREMENTS: Record<ActionType, ActionabilityOptions> = {
  // Interactive click-like actions - require all checks
  [ActionType.CLICK]: { checks: INTERACTIVE_CHECKS },
  [ActionType.CHECK]: { checks: INTERACTIVE_CHECKS },
  [ActionType.UNCHECK]: { checks: INTERACTIVE_CHECKS },
  
  // Hover actions - no enabled check
  [ActionType.HOVER]: { checks: HOVER_CHECKS },
  
  // Input/fill actions - require editability
  [ActionType.CLEAR]: { checks: EDITABLE_CHECKS },
  [ActionType.TYPE]: { checks: EDITABLE_CHECKS },
};

/**
 * Get actionability requirements for a specific action
 */
export function getActionRequirements(actionType: ActionType): ActionabilityOptions {
  return ACTION_REQUIREMENTS[actionType] || {};
}
