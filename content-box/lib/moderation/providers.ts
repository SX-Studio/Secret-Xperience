import type { ScanStatus, AiRisk } from '@/lib/moderation/pipeline';

// Pluggable Trust & Safety providers. Until real providers are wired, both return
// 'unconfigured' — which the pipeline treats as "route to human review", never
// auto-approve. This is intentional fail-closed behavior.

// CSAM hash-matching (Cloudflare CSAM Scanning Tool / PhotoDNA / Thorn Safer).
export async function scanForCsam(_input: { bytes?: Buffer; url?: string }): Promise<ScanStatus> {
  if (!process.env.CSAM_PROVIDER) return 'unconfigured';
  // TODO(provider): call the configured CSAM service and map its verdict.
  return 'unconfigured';
}

// General AI moderation (Hive / AWS Rekognition for media; Anthropic for text).
export async function screenWithAi(_input: {
  bytes?: Buffer;
  url?: string;
  text?: string;
}): Promise<AiRisk> {
  if (!process.env.AI_MODERATION_PROVIDER) return 'unconfigured';
  // TODO(provider): call the configured AI moderation service and map its risk.
  return 'unconfigured';
}
