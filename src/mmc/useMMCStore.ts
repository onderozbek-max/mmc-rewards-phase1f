import * as React from 'react';
import { BenefitDef, MMCState, PendingAchievement, PendingOrdinary, TestingOpportunityAvailability } from './types';
import { findActivity, MILESTONES, nextMilestone, unlockedBenefits } from './data';
import { buildScenario, DEFAULT_SCENARIO, ScenarioId, TODAYS_DATE_LABEL } from './scenarios';

// ───────────────────────────────────────────────────────────────────────────
// Phase 1F state model.
//
// `lifetimePoints` is NEVER stored directly — it is always derived. This is
// what guarantees Home / Community Pass / Profile / Product Testing can
// never drift out of sync with each other, AND (new in 1F) what guarantees a
// reconciled existing member and an organic new member at the same total
// converge onto the exact same derived state (spec §23).
//
// 1F adds a population-aware provenance to that derivation (see
// computeLifetimePoints below) but reuses the 1D/1E milestone-crossing
// engine completely unchanged: on every activity completion we compare the
// before/after lifetime totals against every not-yet-reached milestone and
// fire the achievement moment for whichever one was just crossed. This is
// exactly what makes "reconciled 2,990 + a live +30 activity = a normal live
// 3,000 achievement" work for free (spec §18) — the engine doesn't know or
// care whether `beforeTotal` came from a historical ledger or organic
// earning.
//
// `pendingAchievement` / `pendingOrdinary` are transient, in-memory-only
// state (never persisted) — this is what prevents the achievement moment
// from replaying on refresh/navigation: a refresh reloads the persisted
// `milestonesReached` / `recognitionShownFor` flags, but pendingAchievement
// is always null on load, so the modal never re-fires just because the
// member returned to the app. `recognitionShownFor` additionally guarantees
// each milestone's one-time recognition is milestone-specific (spec §25) —
// crossing 1,000 never replays the 250 moment, crossing 3,000 never replays
// 250 or 1,000. For existing members, `recognitionShownFor` is additionally
// SEEDED with every historically-achieved milestone at reconciliation time
// (see scenarios.ts) — this is what prevents fake historical-achievement
// ceremonies (spec §19/§28).
// ───────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'mmc-phase1f-state-v1';
const SCENARIO_KEY = 'mmc-phase1f-scenario-v1';

interface StoredShape {
  scenarioId: ScenarioId;
  state: MMCState;
}

function isValidStoredState(state: unknown): state is MMCState {
  if (!state || typeof state !== 'object') return false;
  const s = state as Partial<MMCState>;
  if (
    !(
      (s.population === 'new' || s.population === 'existing') &&
      (s.reconciliationStatus === 'not-applicable' || s.reconciliationStatus === 'ok' || s.reconciliationStatus === 'error') &&
      typeof s.reconciliationAcknowledged === 'boolean' &&
      (s.historicalLifetimePoints === null || typeof s.historicalLifetimePoints === 'number') &&
      Array.isArray(s.organicHistory) &&
      Array.isArray(s.priorCommunityHistorySample) &&
      Array.isArray(s.waysToProgressCompletions) &&
      Array.isArray(s.milestonesReached) &&
      Array.isArray(s.recognitionShownFor)
    )
  ) {
    return false;
  }
  // Cross-field invariant: a reconciled ("ok") existing member MUST carry a
  // real historical number — `reconciliationStatus: 'ok'` paired with
  // `historicalLifetimePoints: null` is a malformed/tampered payload, and
  // silently defaulting it to 0 in computeLifetimePoints would produce
  // exactly the false-zero failure spec §26/§38 PAIR 3 forbid. Reject it here
  // so loadInitial falls back to a clean scenario instead.
  if (s.reconciliationStatus === 'ok' && s.population === 'existing' && s.historicalLifetimePoints === null) {
    return false;
  }
  return true;
}

function loadInitial(): StoredShape {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredShape;
      // Scalar fields (population, reconciliationStatus, ...) are new in 1F
      // and would silently come back as `undefined` from a stale/foreign
      // payload if only the array fields were checked — that would either
      // suppress the reconciliation orientation entirely or, worse, report a
      // 0/undefined historical total. Validate every field the derivation
      // and the reconciliation gate depend on before trusting storage.
      if (parsed && isValidStoredState(parsed.state)) {
        return parsed;
      }
    }
  } catch {
    // fall through to default
  }
  const scenarioId = DEFAULT_SCENARIO;
  return { scenarioId, state: buildScenario(scenarioId) };
}

function persist(shape: StoredShape) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(shape));
    window.localStorage.setItem(SCENARIO_KEY, shape.scenarioId);
  } catch {
    // best-effort only — this is a prototype
  }
}

/**
 * Returns `null` when the member's total genuinely cannot be trusted yet
 * (reconciliation error, spec §25-26) — NEVER 0. A `number` return of 0 would
 * read, to every downstream screen, as "this member truthfully has zero
 * lifetime points," which is exactly the false-zero failure mode spec §26 /
 * §38 PAIR 3 prohibit. Callers must treat `null` as "unknown," not "empty."
 */
export function computeLifetimePoints(state: MMCState): number | null {
  if (state.reconciliationStatus === 'error') return null;

  // NEW members: derived from their own organic activity (unchanged 1E
  // behavior). EXISTING members: derived from the reconciled historical
  // ledger, NOT from `priorCommunityHistorySample` — that sample is a
  // display-only excerpt and is never summed (spec §28-29). An existing
  // member with no confirmed historical number is unreliable data, full
  // stop — never coerce it to 0. (This should be unreachable in practice
  // because isValidStoredState rejects that exact combination on load, but
  // the guard stays here too so this function is safe on its own.)
  let base: number;
  if (state.population === 'existing') {
    if (state.historicalLifetimePoints == null) return null;
    base = state.historicalLifetimePoints;
  } else {
    base = state.organicHistory.reduce((sum, h) => sum + h.points, 0);
  }

  const fromWays = state.waysToProgressCompletions.reduce((sum, c) => {
    const activity = findActivity(c.activityId);
    return sum + (activity?.points ?? 0);
  }, 0);
  return base + fromWays;
}

export interface MMCContextValue {
  state: MMCState;
  /** `null` only when reconciliationStatus === 'error' (spec §25-26) — see
   * computeLifetimePoints. Every page that renders this value is gated
   * behind the reconciliation-error screen in App.tsx and additionally
   * guards for null itself (spec §16 defense in depth). */
  lifetimePoints: number | null;
  completedWaysToProgressIds: Set<string>;
  milestonesReached: number[];
  unlockedBenefitsList: BenefitDef[];
  nextMilestonePoints: number | null;
  nextBenefits: BenefitDef[];
  testingOpportunities: TestingOpportunityAvailability;
  pendingAchievement: PendingAchievement | null;
  pendingOrdinary: PendingOrdinary | null;
  completeActivity: (activityId: string) => void;
  dismissAchievement: () => void;
  dismissOrdinary: () => void;
  setTestingOpportunity: (kind: 'basic' | 'premium', available: boolean) => void;
  resetToScenario: (id: ScenarioId) => void;
  currentScenarioId: ScenarioId;
  /** Population + reconciliation gate fields, read directly by App.tsx to
   * decide whether to show the orientation/error screen instead of the
   * normal routed page (spec §7/§14/§25). */
  population: MMCState['population'];
  reconciliationStatus: MMCState['reconciliationStatus'];
  reconciliationAcknowledged: boolean;
  acknowledgeReconciliation: () => void;
}

const MMCContext = React.createContext<MMCContextValue | null>(null);

export function MMCProvider({ children }: { children: React.ReactNode }) {
  const initial = React.useMemo(loadInitial, []);
  const [state, setState] = React.useState<MMCState>(initial.state);
  const [scenarioId, setScenarioId] = React.useState<ScenarioId>(initial.scenarioId);
  const [pendingAchievement, setPendingAchievement] = React.useState<PendingAchievement | null>(null);
  const [pendingOrdinary, setPendingOrdinary] = React.useState<PendingOrdinary | null>(null);

  const lifetimePoints = computeLifetimePoints(state);
  const completedWaysToProgressIds = React.useMemo(
    () => new Set(state.waysToProgressCompletions.map((c) => c.activityId)),
    [state.waysToProgressCompletions],
  );
  const unlockedBenefitsList = React.useMemo(() => unlockedBenefits(state.milestonesReached), [state.milestonesReached]);
  const upcomingMilestone = lifetimePoints != null ? nextMilestone(lifetimePoints) : null;
  const nextMilestonePoints = upcomingMilestone?.points ?? null;
  const nextBenefits = upcomingMilestone?.benefits ?? [];

  const completeActivity = React.useCallback(
    (activityId: string) => {
      setState((prev) => {
        if (prev.waysToProgressCompletions.some((c) => c.activityId === activityId)) {
          return prev; // already completed — no-op, no re-trigger
        }
        const activity = findActivity(activityId);
        if (!activity) return prev;

        const beforeTotal = computeLifetimePoints(prev);
        // Defense in depth (spec §16): activities can only be completed from
        // Home, which App.tsx never renders while reconciliationStatus is
        // 'error' — but guard anyway rather than silently treating unknown
        // as zero.
        if (beforeTotal == null) return prev;
        const afterTotal = beforeTotal + activity.points;
        const crossed = MILESTONES.find(
          (m) => !prev.milestonesReached.includes(m.points) && beforeTotal < m.points && afterTotal >= m.points,
        );

        const next: MMCState = {
          ...prev,
          waysToProgressCompletions: [
            ...prev.waysToProgressCompletions,
            { activityId, dateLabel: TODAYS_DATE_LABEL },
          ],
          milestonesReached: crossed ? [...prev.milestonesReached, crossed.points] : prev.milestonesReached,
        };

        if (crossed) {
          setPendingAchievement({
            milestone: crossed.points,
            pointsEarned: activity.points,
            totalAfter: afterTotal,
            activityTitle: activity.title,
            benefits: crossed.benefits,
          });
        } else {
          const upcoming = nextMilestone(afterTotal);
          setPendingOrdinary({
            pointsEarned: activity.points,
            totalAfter: afterTotal,
            activityTitle: activity.title,
            nextMilestonePoints: upcoming?.points ?? null,
            nextBenefitLabel: upcoming ? upcoming.benefits.map((b) => b.label).join(' + ') : null,
          });
        }

        persist({ scenarioId, state: next });
        return next;
      });
    },
    [scenarioId],
  );

  const dismissAchievement = React.useCallback(() => {
    if (pendingAchievement) {
      const milestone = pendingAchievement.milestone;
      setState((prev) => {
        if (prev.recognitionShownFor.includes(milestone)) return prev;
        const next = { ...prev, recognitionShownFor: [...prev.recognitionShownFor, milestone] };
        persist({ scenarioId, state: next });
        return next;
      });
    }
    setPendingAchievement(null);
  }, [pendingAchievement, scenarioId]);

  const dismissOrdinary = React.useCallback(() => {
    setPendingOrdinary(null);
  }, []);

  const setTestingOpportunity = React.useCallback(
    (kind: 'basic' | 'premium', available: boolean) => {
      setState((prev) => {
        const next = { ...prev, testingOpportunities: { ...prev.testingOpportunities, [kind]: available } };
        persist({ scenarioId, state: next });
        return next;
      });
    },
    [scenarioId],
  );

  const acknowledgeReconciliation = React.useCallback(() => {
    setState((prev) => {
      if (prev.reconciliationAcknowledged) return prev; // one-time only (spec §14)
      const next = { ...prev, reconciliationAcknowledged: true };
      persist({ scenarioId, state: next });
      return next;
    });
  }, [scenarioId]);

  const resetToScenario = React.useCallback((id: ScenarioId) => {
    const next = buildScenario(id);
    setScenarioId(id);
    setState(next);
    setPendingAchievement(null);
    setPendingOrdinary(null);
    persist({ scenarioId: id, state: next });
  }, []);

  const value: MMCContextValue = {
    state,
    lifetimePoints,
    completedWaysToProgressIds,
    milestonesReached: state.milestonesReached,
    unlockedBenefitsList,
    nextMilestonePoints,
    nextBenefits,
    testingOpportunities: state.testingOpportunities,
    pendingAchievement,
    pendingOrdinary,
    completeActivity,
    dismissAchievement,
    dismissOrdinary,
    setTestingOpportunity,
    resetToScenario,
    currentScenarioId: scenarioId,
    population: state.population,
    reconciliationStatus: state.reconciliationStatus,
    reconciliationAcknowledged: state.reconciliationAcknowledged,
    acknowledgeReconciliation,
  };

  return React.createElement(MMCContext.Provider, { value }, children);
}

export function useMMC(): MMCContextValue {
  const ctx = React.useContext(MMCContext);
  if (!ctx) throw new Error('useMMC must be used within MMCProvider');
  return ctx;
}
