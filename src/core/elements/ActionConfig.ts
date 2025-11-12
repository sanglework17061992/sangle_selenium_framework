import { ActionabilityOptions, Check } from './ActionabilityChecker';
import { ActionType } from '../../types/Enums';

const INTERACTIVE_CHECKS: readonly Check[] = ['visible', 'stable', 'receivesEvents', 'enabled'];
const HOVER_CHECKS: readonly Check[] = ['visible', 'stable', 'receivesEvents'];
const EDITABLE_CHECKS: readonly Check[] = ['visible', 'enabled', 'editable'];

export const ACTION_REQUIREMENTS: Record<ActionType, ActionabilityOptions> = {
  [ActionType.CLICK]: { checks: INTERACTIVE_CHECKS },
  [ActionType.CHECK]: { checks: INTERACTIVE_CHECKS },
  [ActionType.UNCHECK]: { checks: INTERACTIVE_CHECKS },
  [ActionType.HOVER]: { checks: HOVER_CHECKS },
  [ActionType.CLEAR]: { checks: EDITABLE_CHECKS },
  [ActionType.TYPE]: { checks: EDITABLE_CHECKS },
};

export function getActionRequirements(actionType: ActionType): ActionabilityOptions {
  return ACTION_REQUIREMENTS[actionType] || {};
}
