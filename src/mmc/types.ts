// Phase 1F — MMC Community Pass state model types.
// Single source of truth: lifetime points are DERIVED, never hand-set — this
// keeps Home / Community Pass / Profile / Product Testing mathematically
// consistent by construction (see AGENTS notes in useMMCStore.ts). 1F adds a
// second, population-aware provenance for that derivation (spec §6/§24):
//   - a NEW member's total is derived from their own organic completed
//     activity (`organicHistory` + `waysToProgressCompletions`) — unchanged
//     from Phase 1E.
//   - an EXISTING member's total is derived from a raw historical-points
//     LEDGER (`historicalLifetimePoints`) reconciled at rollout, plus any
//     `waysToProgressCompletions` earned afterward. The ledger is the source
//     of truth for the total; `priorCommunityHistorySample` is a small,
//     credible, NON-summed sample of that history shown in Profile (spec
//     §28-29) — never a fabricated activity list built to add up correctly.
//
// 1E generalized the Phase 1D single-milestone model into a MILESTONE →
// BENEFITS[] architecture so the currently aligned 250 / 1,000 / 3,000
// journey is fully operational and future milestones/benefits can be added
// without a rewrite (spec §5/§26). 1F reuses that engine unchanged for
// deriving achieved milestones/benefits from a lifetime-points number,
// regardless of whether that number came from organic earning or historical
// reconciliation (spec §23 full-population convergence).

export interface ActivityDef {
  id: string;
  title: string;
  description: string;
  points: number;
  endDateLabel: string;
}

export interface HistoricalCompletion {
  id: string;
  title: string;
  points: number;
  dateLabel: string;
}

export interface WaysToProgressCompletion {
  activityId: string;
  dateLabel: string;
}

/** The kind of benefit a milestone unlocks. Extensible — new kinds can be
 * added later without touching the milestone-crossing engine. */
export type BenefitKind = 'content' | 'basic-testing' | 'premium-testing';

/** One concrete, currently-aligned benefit attached to a milestone. A
 * milestone may carry more than one of these (spec §5). */
export interface BenefitDef {
  id: string;
  kind: BenefitKind;
  /** Lowercase, sentence-embeddable label, e.g. "basic product-testing eligibility". */
  label: string;
}

/** A single lifetime-point benefit milestone. Every milestone in this array
 * is operational — 1E has no "future/undefined" placeholder milestones. */
export interface MilestoneDef {
  points: number;
  benefits: BenefitDef[];
}

/** One concrete item inside the unlocked Community content module (What's
 * New / Member Favorites). */
export interface BenefitContentItem {
  title: string;
  description: string;
}

/** Prototype-only control for whether a matching test currently exists for
 * a given testing tier. This is demo tooling, NOT derived from points —
 * eligibility (points) and opportunity supply (this) are independent
 * concepts (spec §15/§17-20). */
export interface TestingOpportunityAvailability {
  basic: boolean;
  premium: boolean;
}

/** Was this member already active in MMC before Community Pass rolled out to
 * the full population, or did they start fresh inside it (spec §22)? This is
 * the explicit architectural switch between the two entry paths — not an
 * inferred/implicit distinction. */
export type PopulationType = 'new' | 'existing';

/** Whether an EXISTING member's historical points ledger was successfully
 * reconciled. 'not-applicable' is the NEW-member case (no ledger exists to
 * reconcile). 'error' is the safe-failure/pending case (spec §25-26) — never
 * silently coerced to a point total of 0. */
export type ReconciliationStatus = 'not-applicable' | 'ok' | 'error';

export interface MMCState {
  memberName: string;
  memberSinceLabel: string;
  population: PopulationType;

  /** NEW members only: their own organic completed activity, summed into
   * lifetime points exactly (unchanged 1E behavior). Empty for existing
   * members. */
  organicHistory: HistoricalCompletion[];

  /** EXISTING members only, and only when reconciliationStatus === 'ok': the
   * raw historical lifetime-points LEDGER — the single source of truth for
   * their pre-rollout total (spec §6/§24). Never derived from a visible
   * activity list. Null for new members and for unreconciled/error members. */
  historicalLifetimePoints: number | null;

  /** EXISTING members only: a small, credible, NON-summed sample of prior
   * Community activity for display in Profile (spec §28-29). This list is
   * deliberately NOT the source of the lifetime-points total and is not
   * implied to be the complete history. */
  priorCommunityHistorySample: HistoricalCompletion[];

  /** EXISTING members only: whether the historical ledger could be safely
   * reconciled at rollout. 'not-applicable' for new members. */
  reconciliationStatus: ReconciliationStatus;

  /** EXISTING members only: has the one-time first-entry reconciliation
   * orientation (spec §7/§14) already been shown/dismissed? Persisted so a
   * refresh/navigation never replays it. Entitlements below are true
   * regardless of this flag's value (spec §15) — this only gates the
   * explanatory UI, never the underlying product state. */
  reconciliationAcknowledged: boolean;

  waysToProgressCompletions: WaysToProgressCompletion[];
  /** Milestone point thresholds the member has reached, e.g. [250, 1000].
   * For existing members this is SEEDED at reconciliation time from
   * historicalLifetimePoints (spec §6/§19), not earned through the app. */
  milestonesReached: number[];
  /** Milestone point thresholds whose one-time achievement recognition has
   * already been shown/dismissed — prevents replay per milestone (spec §25).
   * For existing members, every historically-achieved milestone is
   * pre-seeded in here too, so no fake "you just reached 250!" ceremony ever
   * fires for contribution the member already made before rollout (spec
   * §19/§28-38 PAIR 2). */
  recognitionShownFor: number[];
  testingOpportunities: TestingOpportunityAvailability;
}

export interface PendingAchievement {
  milestone: number;
  pointsEarned: number;
  totalAfter: number;
  activityTitle: string;
  benefits: BenefitDef[];
}

export interface PendingOrdinary {
  pointsEarned: number;
  totalAfter: number;
  activityTitle: string;
  /** Next operational milestone point threshold, or null once no further
   * milestone is defined (3,000+ terminal/current state — spec §8/§10). */
  nextMilestonePoints: number | null;
  nextBenefitLabel: string | null;
}

export type Route = 'home' | 'profile' | 'community-pass' | 'product-testing';
