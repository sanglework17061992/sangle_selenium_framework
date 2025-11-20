import { Check, ActionType } from '@enums';

/**
 * Action requirements for each action type
 * Note: Check.VISIBLE is always checked implicitly in ActionabilityChecker
 */
const ACTION_CHECKS: Partial<Record<ActionType, readonly Check[]>> = {
  [ActionType.CLICK]: [Check.STABLE, Check.ENABLED],
  [ActionType.TYPE]: [Check.EDITABLE],
  [ActionType.READ]: [],
  // TODO: Implement other actions (CHECK, UNCHECK, HOVER, CLEAR)
};

/**
 * Get required checks for an action type
 * Note: Check.VISIBLE is always checked implicitly in ActionabilityChecker
 */
export function getActionRequirements(actionType: ActionType): { checks: readonly Check[] } {
  const explicitChecks = ACTION_CHECKS[actionType] ?? [];
  return { checks: explicitChecks };
}