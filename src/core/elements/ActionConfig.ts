import { Check, ActionType } from '../../types/Enums';

// Simple array-based action requirements mapping
const ACTION_CHECKS: Array<[ActionType, readonly Check[]]> = [
  // Interaction actions - require full checks
  [ActionType.CLICK, [Check.VISIBLE, Check.STABLE, Check.ENABLED]],
  [ActionType.CHECK, [Check.VISIBLE, Check.STABLE, Check.ENABLED]],
  [ActionType.UNCHECK, [Check.VISIBLE, Check.STABLE, Check.ENABLED]],
  [ActionType.HOVER, [Check.VISIBLE, Check.STABLE]],
  [ActionType.CLEAR, [Check.VISIBLE, Check.ENABLED, Check.EDITABLE]],
  [ActionType.TYPE, [Check.VISIBLE, Check.ENABLED, Check.EDITABLE]],
  // Generic read action - only needs visibility
  [ActionType.READ, [Check.VISIBLE]],
];

export function getActionRequirements(actionType: ActionType): { checks: readonly Check[] } {
  const found = ACTION_CHECKS.find(([type]) => type === actionType);
  return { checks: found ? found[1] : [] };
}