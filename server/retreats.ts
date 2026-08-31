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
  onlineSalesOpen: boolean;
  capacity: number | null;
  // Canonical pricing (CAD, pre-tax). This is the source of truth used by
  // the Stripe checkout flow - the server NEVER trusts a client-supplied
  // amount. Keep these values in sync with what the client displays.
  depositAmount: number;
  fullAmount: number;
}

export const RETREATS: RetreatContainer[] = [
  { id: 1, name: "Winter Descent",   date: "February 2026",            isPast: true,  onlineSalesOpen: false, capacity: null, depositAmount: 250, fullAmount: 555  },
  { id: 2, name: "Spring Awakening", date: "May 2026",                 isPast: true,  onlineSalesOpen: false, capacity: null, depositAmount: 250, fullAmount: 555  },
  { id: 3, name: "Grounded Warriors Marmora", date: "October 9 – 11, 2026", isPast: false, onlineSalesOpen: true, capacity: 12, depositAmount: 250, fullAmount: 499  },
  { id: 4, name: "Spring Awakening", date: "April 30 – May 3, 2027",   isPast: false, onlineSalesOpen: false, capacity: null, depositAmount: 250, fullAmount: 1999 },
  // Single-payment events: depositAmount 0 means "full payment only"
  // (getRetreatPrice returns null for deposit, so the server rejects it).
  { id: 6, name: "Grounded Warriors Men's Dinner", date: "August 20, 2026",   isPast: true, onlineSalesOpen: false, capacity: null, depositAmount: 0, fullAmount: 100 },
  { id: 7, name: "GW Train, Breath & Plunge",      date: "September 12, 2026", isPast: false, onlineSalesOpen: false, capacity: null, depositAmount: 0, fullAmount: 150 },
  // Planning is open, but this trip is not available for online payment yet.
  { id: 8, name: "Costa Rica Volunteer Trip",     date: "Second week of December 2026", isPast: false, onlineSalesOpen: false, capacity: null, depositAmount: 500, fullAmount: 3000 },
];

export type PaymentType = "deposit" | "full";

export function getRetreat(id: number): RetreatContainer | undefined {
  return RETREATS.find((r) => r.id === id);
}

export function isValidRetreatId(id: number): boolean {
  return RETREATS.some((r) => r.id === id);
}

// Returns the canonical pre-tax amount for a retreat + payment type, or
// null if the retreat is unknown or not payable online (e.g. amount <= 0).
export function getRetreatPrice(id: number, paymentType: PaymentType): number | null {
  const retreat = getRetreat(id);
  if (!retreat || retreat.isPast || !retreat.onlineSalesOpen || retreat.capacity === null) return null;
  // Deposits remain disabled until a balance/invoicing lifecycle is in place.
  if (paymentType !== "full") return null;
  const amount = retreat.fullAmount;
  if (!amount || amount <= 0) return null;
  return amount;
}
