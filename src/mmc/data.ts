import { ActivityDef, BenefitContentItem, BenefitDef, HistoricalCompletion, MilestoneDef } from './types';

/** The date Community Pass's full-population rollout happened (spec §22).
 * Members who joined MMC before this date are the EXISTING population and go
 * through historical reconciliation; members who joined on/after it are the
 * NEW population and never see a reconciliation orientation. This is an
 * explicit architectural anchor, not an inferred property of a point total. */
export const ROLLOUT_DATE_LABEL = 'September 26, 2026';

// ─────────────────────────────────────────────────────────────────────────
// "Ways to make progress" / "Open activities" — the actionable activities.
// The first three carry the exact point values (30 / 20 / 30) that let a
// stakeholder walk natural journeys (e.g. 990 → 1,020, 2,990 → 3,020) through
// normal tapping alone — no developer tool is required to cross a milestone.
// The remaining two demonstrate ordinary post-unlock completion: one
// ordinary +10 award, and one 0-point activity.
// ─────────────────────────────────────────────────────────────────────────
export const WAYS_TO_PROGRESS: ActivityDef[] = [
  {
    id: 'shape-products',
    title: 'See how members help shape products',
    description: 'Follow feedback from idea to club.',
    points: 30,
    endDateLabel: 'Ends November 1, 2026',
  },
  {
    id: 'tell-us',
    title: 'Tell us what you think',
    description: 'Quick feedback on your recent Community experience.',
    points: 20,
    endDateLabel: 'Ends October 15, 2026',
  },
  {
    id: 'household-favorites',
    title: 'Share your Member’s Mark household favorites',
    description: "Tell us which Member's Mark products you can't live without.",
    points: 30,
    endDateLabel: 'Ends December 1, 2026',
  },
  {
    id: 'weekly-checkin',
    title: 'Weekly Community check-in',
    description: 'A quick pulse check on how your week is going.',
    points: 10,
    endDateLabel: 'Ends October 20, 2026',
  },
  {
    id: 'todays-visit',
    title: "How was today's visit?",
    description: "Share a quick reaction to today's shopping trip.",
    points: 0,
    endDateLabel: 'Ends today',
  },
];

export function findActivity(id: string): ActivityDef | undefined {
  return WAYS_TO_PROGRESS.find((a) => a.id === id);
}

// ─────────────────────────────────────────────────────────────────────────
// Community Pass benefit architecture (spec §5/§26): MILESTONE → BENEFITS[].
// All three currently aligned milestones are operational in 1E. Benefit
// labels are lowercase/sentence-embeddable — callers capitalize when a
// benefit label opens a sentence (see `capitalize` below).
// ─────────────────────────────────────────────────────────────────────────
export const COMMUNITY_CONTENT_BENEFIT: BenefitDef = {
  id: 'community-content',
  kind: 'content',
  label: "What's New + Member Favorites",
};

export const BASIC_TESTING_BENEFIT: BenefitDef = {
  id: 'basic-testing',
  kind: 'basic-testing',
  label: 'basic product-testing eligibility',
};

export const PREMIUM_TESTING_BENEFIT: BenefitDef = {
  id: 'premium-testing',
  kind: 'premium-testing',
  label: 'premium product-testing eligibility',
};

export const MILESTONES: MilestoneDef[] = [
  { points: 250, benefits: [COMMUNITY_CONTENT_BENEFIT] },
  { points: 1000, benefits: [BASIC_TESTING_BENEFIT] },
  { points: 3000, benefits: [PREMIUM_TESTING_BENEFIT] },
];

export function capitalize(label: string): string {
  return label.length ? label.charAt(0).toUpperCase() + label.slice(1) : label;
}

export function benefitLabelList(benefits: BenefitDef[]): string {
  return benefits.map((b) => b.label).join(' + ');
}

/** Union of benefits across every achieved milestone (spec §6/§26) — never
 * gated behind "only the highest milestone reached". */
export function unlockedBenefits(milestonesReached: number[]): BenefitDef[] {
  return MILESTONES.filter((m) => milestonesReached.includes(m.points)).flatMap((m) => m.benefits);
}

/** First not-yet-reached milestone, or null once every currently aligned
 * milestone has been reached (spec §7/§8 — no progress toward an undefined
 * destination). */
export function nextMilestone(lifetimePoints: number): MilestoneDef | null {
  return MILESTONES.find((m) => m.points > lifetimePoints) ?? null;
}

export function milestoneByPoints(points: number): MilestoneDef | undefined {
  return MILESTONES.find((m) => m.points === points);
}

export function isMilestoneUnlocked(points: number, milestonesReached: number[]): boolean {
  return milestonesReached.includes(points);
}

// ─────────────────────────────────────────────────────────────────────────
// The actual content of the unlocked 250-point Community content benefit.
// Two real Community modules, not a product catalog.
// ─────────────────────────────────────────────────────────────────────────
export const WHATS_NEW_ITEMS: BenefitContentItem[] = [
  {
    title: 'Fall flavor lineup: early feedback',
    description: 'Be among the first Community members invited to taste-test and weigh in before products reach shelves.',
  },
  {
    title: 'New sampling events near you',
    description: 'Fresh in-club sampling opportunities are added regularly for members who unlock this benefit.',
  },
];

export const MEMBER_FAVORITES_ITEMS: BenefitContentItem[] = [
  {
    title: 'Most-loved by the Community',
    description: 'See which recent activities and product conversations other members engaged with most.',
  },
  {
    title: 'Member-recommended picks',
    description: 'A rotating list of products and experiences members are talking about right now.',
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Deterministic synthetic seed-history generator, used two ways in 1F:
//
//  1. `buildOrganicHistory(target)` — for NEW members only. These are just
//     ordinary completed Community activities, dated before "today", whose
//     points sum EXACTLY to the scenario's target — lifetime points for a
//     new member are never hand-set anywhere in this codebase, same as 1E.
//
//  2. `buildPriorCommunityHistorySample(target)` — for EXISTING members. A
//     small, credible, capped-size sample of prior activity for Profile
//     display ONLY. It deliberately does NOT sum to the member's lifetime
//     points — that total comes from the `historicalLifetimePoints` ledger
//     instead (spec §6/§24/§28-29). Fabricating dozens of activities so a
//     visible list adds up to 1,500 or 3,500 is exactly what spec §29
//     prohibits; this generator caps at a handful of representative entries
//     regardless of how large the ledger total is.
// ─────────────────────────────────────────────────────────────────────────
const HISTORY_BANK: { title: string; points: number }[] = [
  { title: 'Welcome bonus: joined the Community', points: 20 },
  { title: 'Rate your last Sam’s Club visit', points: 10 },
  { title: 'Share a photo of your Member’s Mark find', points: 20 },
  { title: 'Community check-in', points: 20 },
  { title: 'Tell us about your household', points: 10 },
  { title: 'Quick poll: shopping habits', points: 10 },
  { title: 'Rate a recent Member’s Mark product', points: 20 },
  { title: 'Help shape our next Member’s Mark launch', points: 30 },
  { title: 'Community recipe swap', points: 20 },
  { title: 'Quick poll: home essentials', points: 20 },
];

function formatHistoryDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// Historical activity can never be dated after "today" — a completed
// activity from the future would be an obvious truthfulness bug. The window
// below spans member-since (June 14, 2026) through the day before the
// prototype's simulated "today" (September 26, 2026 — see TODAYS_DATE_LABEL
// in scenarios.ts); entries are distributed evenly across it rather than at
// a fixed cadence, so a scenario needing many entries (e.g. 3,500 points)
// still lands entirely inside the window instead of overflowing into 2027.
const HISTORY_WINDOW_START = new Date(2026, 5, 14); // June 14, 2026
const HISTORY_WINDOW_END = new Date(2026, 8, 25); // September 25, 2026 — the day before "today"

function datedEntries(entries: { title: string; points: number }[], idPrefix: string): HistoricalCompletion[] {
  const count = entries.length;
  const spanMs = HISTORY_WINDOW_END.getTime() - HISTORY_WINDOW_START.getTime();
  return entries.map((entry, index) => {
    const dateMs =
      count <= 1
        ? HISTORY_WINDOW_END.getTime()
        : HISTORY_WINDOW_START.getTime() + Math.round((spanMs * index) / (count - 1));
    return {
      id: `${idPrefix}${index + 1}`,
      title: entry.title,
      points: entry.points,
      dateLabel: formatHistoryDate(new Date(dateMs)),
    };
  });
}

/** NEW members only — sums exactly to `target` by construction (spec §30). */
export function buildOrganicHistory(target: number): HistoricalCompletion[] {
  const entries: { title: string; points: number }[] = [];
  let remaining = target;
  let i = 0;
  while (remaining > 0) {
    const bankItem = HISTORY_BANK[i % HISTORY_BANK.length];
    const points = Math.min(bankItem.points, remaining);
    entries.push({ title: bankItem.title, points });
    remaining -= points;
    i += 1;
  }
  return datedEntries(entries, 'h');
}

/** EXISTING members only — a small, credible, NON-summed recent-activity
 * sample for Profile (spec §28-29). Capped at 5 entries regardless of the
 * ledger total, and scaled down further for small totals so a 180-point
 * member doesn't get a suspiciously long history. Never used to compute
 * lifetime points. */
export function buildPriorCommunityHistorySample(historicalLifetimePoints: number): HistoricalCompletion[] {
  const count = historicalLifetimePoints >= 1000 ? 5 : historicalLifetimePoints >= 250 ? 3 : 2;
  const entries = Array.from({ length: count }, (_, i) => HISTORY_BANK[i % HISTORY_BANK.length]);
  return datedEntries(entries, 'p');
}

/** The reconciliation algorithm (spec §6): a pure function of the historical
 * ledger number, reusing the SAME milestone/benefit engine that drives every
 * other part of the product — nothing member-specific is hard-coded here. */
export interface ReconciliationResult {
  achievedMilestonePoints: number[];
  benefits: BenefitDef[];
  nextMilestonePoints: number | null;
  nextBenefits: BenefitDef[];
  pointsRemaining: number | null;
}

export function reconcileHistoricalPoints(historicalLifetimePoints: number): ReconciliationResult {
  const achievedMilestonePoints = MILESTONES.filter((m) => historicalLifetimePoints >= m.points).map((m) => m.points);
  const upcoming = nextMilestone(historicalLifetimePoints);
  return {
    achievedMilestonePoints,
    benefits: unlockedBenefits(achievedMilestonePoints),
    nextMilestonePoints: upcoming?.points ?? null,
    nextBenefits: upcoming?.benefits ?? [],
    pointsRemaining: upcoming ? upcoming.points - historicalLifetimePoints : null,
  };
}
