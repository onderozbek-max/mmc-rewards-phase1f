import { MMCState, WaysToProgressCompletion } from './types';
import { buildOrganicHistory, buildPriorCommunityHistorySample, ROLLOUT_DATE_LABEL } from './data';

// ─────────────────────────────────────────────────────────────────────────
// Phase 1F prototype/QA scenarios (spec §27). Two populations, one product:
//
//  - NEW members (population: 'new') start naturally inside Community Pass.
//    No reconciliation orientation ever fires for them (spec §22).
//
//  - EXISTING members (population: 'existing') carry a historical points
//    LEDGER (`historicalLifetimePoints`) reconciled at rollout. Their
//    `milestonesReached` / `recognitionShownFor` are SEEDED here from that
//    ledger via the same achieved-milestone rule the live engine uses (spec
//    §6/§19) — this is what prevents fake "you just reached 250!" ceremonies
//    from firing for contribution the member already made before rollout.
//
// Scenarios are labeled A-I to match spec §27 exactly, plus one additional
// (J) convergence-check scenario used for the self-audit in spec §38 PAIR 1.
// ─────────────────────────────────────────────────────────────────────────
export type ScenarioId =
  | 'a-new-180'
  | 'b-existing-180'
  | 'c-existing-700'
  | 'd-existing-1500'
  | 'e-existing-2990'
  | 'f-existing-3500'
  | 'g-reconciled-1500-acknowledged'
  | 'h-reconciliation-error'
  | 'i-reconciled-2990-acknowledged'
  | 'j-new-1500-convergence-check';

export interface ScenarioDef {
  id: ScenarioId;
  label: string;
  description: string;
  build: () => MMCState;
}

const MEMBER_NAME = 'Onder';
const EXISTING_MEMBER_SINCE = 'June 2026'; // before rollout
const NEW_MEMBER_SINCE = ROLLOUT_DATE_LABEL; // on/after rollout
const TODAY_LABEL = 'September 26, 2026';

const SHAPE_PRODUCTS_COMPLETION: WaysToProgressCompletion = { activityId: 'shape-products', dateLabel: TODAY_LABEL };

function achievedMilestonesFor(historicalLifetimePoints: number): number[] {
  return [250, 1000, 3000].filter((points) => historicalLifetimePoints >= points);
}

/** NEW member — no ledger, no reconciliation, unchanged 1E-style organic
 * history. Optionally pre-seeded with already-crossed milestones so a
 * post-rollout organic member can be compared against a reconciled existing
 * member at the same total (spec §38 PAIR 1). */
function newMemberState(
  organicTarget: number,
  extra: { milestonesReached?: number[]; recognitionShownFor?: number[] } = {},
): MMCState {
  return {
    memberName: MEMBER_NAME,
    memberSinceLabel: NEW_MEMBER_SINCE,
    population: 'new',
    organicHistory: buildOrganicHistory(organicTarget),
    historicalLifetimePoints: null,
    priorCommunityHistorySample: [],
    reconciliationStatus: 'not-applicable',
    reconciliationAcknowledged: true, // n/a for new members — nothing to acknowledge
    waysToProgressCompletions: [],
    milestonesReached: extra.milestonesReached ?? achievedMilestonesFor(organicTarget),
    recognitionShownFor: extra.recognitionShownFor ?? achievedMilestonesFor(organicTarget),
    testingOpportunities: { basic: false, premium: false },
  };
}

/** EXISTING member — reconciled from a historical points ledger. Achieved
 * milestones + their recognition are seeded together (spec §19) so no
 * historical achievement ever replays as a live ceremony. */
function existingMemberState(
  historicalLifetimePoints: number,
  extra: {
    reconciliationAcknowledged?: boolean;
    waysToProgressCompletions?: WaysToProgressCompletion[];
  } = {},
): MMCState {
  const achieved = achievedMilestonesFor(historicalLifetimePoints);
  return {
    memberName: MEMBER_NAME,
    memberSinceLabel: EXISTING_MEMBER_SINCE,
    population: 'existing',
    organicHistory: [],
    historicalLifetimePoints,
    priorCommunityHistorySample: buildPriorCommunityHistorySample(historicalLifetimePoints),
    reconciliationStatus: 'ok',
    reconciliationAcknowledged: extra.reconciliationAcknowledged ?? false,
    waysToProgressCompletions: extra.waysToProgressCompletions ?? [],
    milestonesReached: achieved,
    recognitionShownFor: achieved,
    testingOpportunities: { basic: false, premium: false },
  };
}

/** EXISTING member whose historical ledger could not be safely reconciled
 * (spec §25-26) — no point total is guessed, nothing is zeroed. */
function reconciliationErrorState(): MMCState {
  return {
    memberName: MEMBER_NAME,
    memberSinceLabel: EXISTING_MEMBER_SINCE,
    population: 'existing',
    organicHistory: [],
    historicalLifetimePoints: null,
    priorCommunityHistorySample: [],
    reconciliationStatus: 'error',
    reconciliationAcknowledged: false,
    waysToProgressCompletions: [],
    milestonesReached: [],
    recognitionShownFor: [],
    testingOpportunities: { basic: false, premium: false },
  };
}

export const SCENARIOS: ScenarioDef[] = [
  {
    id: 'a-new-180',
    label: 'A — New member, 180 points',
    description:
      'Joined after rollout. 180 lifetime points from ordinary organic activity. No historical ledger — no reconciliation orientation ever fires for this member (spec §22).',
    build: () => newMemberState(180),
  },
  {
    id: 'b-existing-180',
    label: 'B — Existing member, 180 historical points (first entry)',
    description:
      '180 historical lifetime points reconciled at rollout. Below the 250 milestone. First-entry orientation communicates points recognized + distance to 250 — never "nothing unlocked."',
    build: () => existingMemberState(180),
  },
  {
    id: 'c-existing-700',
    label: 'C — Existing member, 700 historical points (first entry)',
    description:
      '700 historical lifetime points. Community content already available; progressing toward 1,000. First entry does NOT replay a 250 achievement ceremony.',
    build: () => existingMemberState(700),
  },
  {
    id: 'd-existing-1500',
    label: 'D — Existing member, 1,500 historical points (first entry)',
    description:
      'Critical acceptance scenario (spec §11). 1,500 historical points: Community content + basic product-testing eligibility already available; next destination is 3,000. No 250/1,000 ceremonies replay.',
    build: () => existingMemberState(1500),
  },
  {
    id: 'e-existing-2990',
    label: 'E — Existing member, 2,990 historical points (first entry)',
    description:
      '2,990 historical points, 10 short of 3,000. First entry reconciles silently; the live 3,000 achievement moment is still available to trigger through normal tapping after acknowledgment.',
    build: () => existingMemberState(2990),
  },
  {
    id: 'f-existing-3500',
    label: 'F — Existing member, 3,500 historical points (first entry)',
    description:
      '3,500 historical points — all three currently aligned milestones already achieved. No fabricated next milestone; lifetime points continue accumulating.',
    build: () => existingMemberState(3500),
  },
  {
    id: 'g-reconciled-1500-acknowledged',
    label: 'G — Reconciled 1,500, orientation already acknowledged',
    description:
      'Same durable state as D, but the one-time orientation has already been acknowledged — boots straight into the normal Community Pass product. Compare against J for full-population convergence (spec §38 PAIR 1).',
    build: () => existingMemberState(1500, { reconciliationAcknowledged: true }),
  },
  {
    id: 'h-reconciliation-error',
    label: 'H — Reconciliation error (data unavailable)',
    description:
      'The historical ledger could not be confirmed. Shows the restrained "we\'re updating your Community Pass" state — never a false 0, never a guessed total (spec §25-26 / §38 PAIR 3).',
    build: () => reconciliationErrorState(),
  },
  {
    id: 'i-reconciled-2990-acknowledged',
    label: 'I — Reconciled 2,990, acknowledged — post-reconciliation crossing',
    description:
      'Same durable state as E, already acknowledged. Complete "See how members help shape products" (+30) to naturally cross 2,990 → 3,020 and watch the LIVE 3,000-point achievement fire — with no replay of 250/1,000 (spec §18/§38 PAIR 2).',
    build: () => existingMemberState(2990, { reconciliationAcknowledged: true }),
  },
  {
    id: 'j-new-1500-convergence-check',
    label: 'J — New member, 1,500 points (convergence check vs. G)',
    description:
      'A member who organically reached 1,500 after rollout — no reconciliation involved. Should be durably IDENTICAL to scenario G (same points, milestones, benefits, next destination, eligibility) even though the entry path differed (spec §23/§38 PAIR 1).',
    build: () => newMemberState(1500),
  },
];

export const DEFAULT_SCENARIO: ScenarioId = 'a-new-180';
export const TODAYS_DATE_LABEL = TODAY_LABEL;

export function buildScenario(id: ScenarioId): MMCState {
  const scenario = SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
  return scenario.build();
}
