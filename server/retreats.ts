// Canonical registry of retreat containers.
//
// Each entry here is a private, persistent space that members can be
// granted access to (either by registering for the retreat or being
// designated as staff). The IDs here are the source of truth used by
// `discussions.retreatId`, `retreat_registrations.retreatId`, and
// `retreat_staff.retreatId`.
//
// IDs are stable - never reuse or renumber. Add new retreats with the
// next available integer.

export interface RetreatContainer {
  id: number;
  name: string;
  date: string;
  isPast: boolean;
}

export const RETREATS: RetreatContainer[] = [
  { id: 1, name: "Winter Descent",   date: "February 2026",            isPast: true  },
  { id: 2, name: "Spring Awakening", date: "May 2026",                 isPast: true  },
  { id: 3, name: "Equinox Gathering", date: "September 2026",          isPast: false },
  { id: 4, name: "Spring Awakening", date: "April 30 – May 3, 2027",   isPast: false },
];

export function getRetreat(id: number): RetreatContainer | undefined {
  return RETREATS.find((r) => r.id === id);
}

export function isValidRetreatId(id: number): boolean {
  return RETREATS.some((r) => r.id === id);
}
