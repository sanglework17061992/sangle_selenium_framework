import { ActionabilityOptions } from './ActionabilityChecker';
import { ActionType } from '../../types/Enums';

export const ACTION_REQUIREMENTS: Record<ActionType, ActionabilityOptions> = {
  [ActionType.CLICK]: { checks: ['visible', 'stable', 'receivesEvents', 'enabled'] },
  [ActionType.CHECK]: { checks: ['visible', 'stable', 'receivesEvents', 'enabled'] },
  [ActionType.UNCHECK]: { checks: ['visible', 'stable', 'receivesEvents', 'enabled'] },
  [ActionType.HOVER]: { checks: ['visible', 'stable', 'receivesEvents'] },
  [ActionType.CLEAR]: { checks: ['visible', 'enabled', 'editable'] },
  [ActionType.TYPE]: { checks: ['visible', 'enabled', 'editable'] },
};

export function getActionRequirements(actionType: ActionType): ActionabilityOptions {
  return ACTION_REQUIREMENTS[actionType] || {};
}
