import { Check, ActionType } from '../../types/Enums';

/**
 * Action requirements for each action type
 * Note: Check.VISIBLE is implicitly added for all actions
 */
const ACTION_CHECKS: Partial<Record<ActionType, readonly Check[]>> = {
  [ActionType.CLICK]: [Check.STABLE, Check.ENABLED],
  [ActionType.TYPE]: [Check.EDITABLE],
  [ActionType.READ]: [],
  // TODO: Implement other actions (CHECK, UNCHECK, HOVER, CLEAR)
};

/**
 * Get required checks for an action type
 * Note: Check.VISIBLE is implicitly added for all actions
 */
export function getActionRequirements(actionType: ActionType): { checks: readonly Check[] } {
  const explicitChecks = ACTION_CHECKS[actionType] ?? [];
  // VISIBLE is implicit for all actions
  const allChecks: Check[] = [Check.VISIBLE, ...explicitChecks];
  return { checks: allChecks };
}