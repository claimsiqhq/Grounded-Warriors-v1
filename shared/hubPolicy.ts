export type HubRole = "member" | "admin" | string;

export function canAccessRetreatFromFacts(input: {
  role: HubRole;
  hasPaidRegistration: boolean;
  isAssignedStaff: boolean;
}) {
  return (
    input.role === "admin" ||
    input.hasPaidRegistration ||
    input.isAssignedStaff
  );
}

export function canManageRetreatFromFacts(input: {
  role: HubRole;
  isAssignedStaff: boolean;
}) {
  return input.role === "admin" || input.isAssignedStaff;
}

export function isValidBuddyPair(input: {
  userOneId: string;
  userTwoId: string;
  bothOptedIn: boolean;
  eitherAlreadyMatched: boolean;
}) {
  return (
    input.userOneId.length > 0 &&
    input.userTwoId.length > 0 &&
    input.userOneId !== input.userTwoId &&
    input.bothOptedIn &&
    !input.eitherAlreadyMatched
  );
}
