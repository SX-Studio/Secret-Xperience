// Trust & Safety decision logic — PURE and FAIL-CLOSED.
// Content is auto-approved ONLY when the CSAM scan is clean AND the AI risk is
// low. Every other combination (including unconfigured/missing providers) routes
// to human review or rejection — never a silent auto-approve.

export type ScanStatus = 'pending' | 'clear' | 'flagged' | 'error' | 'unconfigured';
export type AiRisk = 'low' | 'uncertain' | 'high' | 'error' | 'unconfigured';
export type ContentStatus =
  | 'draft'
  | 'processing'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'deleted';

export interface Decision {
  status: Extract<ContentStatus, 'approved' | 'pending_review' | 'rejected'>;
  reason: string;
}

export function decideStatus(csam: ScanStatus, ai: AiRisk): Decision {
  // CSAM takes absolute priority and fails closed.
  if (csam === 'flagged') return { status: 'rejected', reason: 'csam_flagged' };
  if (csam !== 'clear') return { status: 'pending_review', reason: `csam_${csam}` };

  // CSAM is clean — weigh AI risk.
  if (ai === 'high') return { status: 'rejected', reason: 'ai_high_risk' };
  if (ai === 'low') return { status: 'approved', reason: 'auto_approved_low_risk' };

  // uncertain / error / unconfigured → a human decides. AI is never the sole
  // approver, and a missing provider must never approve.
  return { status: 'pending_review', reason: `ai_${ai}` };
}

// Aggregate per-file scan results into the worst-case content-level status.
export function aggregate(files: { csam: ScanStatus; ai: AiRisk }[]): Decision {
  if (files.length === 0) return { status: 'pending_review', reason: 'no_files' };
  let decision: Decision = { status: 'approved', reason: 'auto_approved_low_risk' };
  const rank = { approved: 0, pending_review: 1, rejected: 2 } as const;
  for (const f of files) {
    const d = decideStatus(f.csam, f.ai);
    if (rank[d.status] > rank[decision.status]) decision = d;
  }
  return decision;
}
