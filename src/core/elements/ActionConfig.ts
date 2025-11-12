import { ActionabilityOptions, Check } from './ActionabilityChecker';
import { ActionType } from '../../types/Enums';

export const ACTION_REQUIREMENTS: Record<ActionType, ActionabilityOptions> = {
  [ActionType.CLICK]: { checks: [Check.VISIBLE, Check.STABLE, Check.ENABLED] },
  [ActionType.CHECK]: { checks: [Check.VISIBLE, Check.STABLE, Check.ENABLED] },
  [ActionType.UNCHECK]: { checks: [Check.VISIBLE, Check.STABLE, Check.ENABLED] },
  [ActionType.HOVER]: { checks: [Check.VISIBLE, Check.STABLE] },
  [ActionType.CLEAR]: { checks: [Check.VISIBLE, Check.ENABLED, Check.EDITABLE] },
  [ActionType.TYPE]: { checks: [Check.VISIBLE, Check.ENABLED, Check.EDITABLE] },
};

export function getActionRequirements(actionType: ActionType): ActionabilityOptions {
  return ACTION_REQUIREMENTS[actionType] || {};
}
