export type Urgency = "low" | "medium" | "high" | "critical";

export interface ConstituentCase {
  id: string;
  received_at: string; // ISO date
  constituent_name: string;
  constituent_email: string;
  state: string; // e.g., "GA"
  zip: string;
  subject: string;
  body: string;
}

export interface TriageResult {
  agency: string;
  agency_code: string; // e.g., "VA", "SSA", "CMS", "IRS", "USCIS"
  sub_office?: string; // e.g., "Atlanta Regional Office"
  issue_category: string;
  urgency: Urgency;
  summary: string;
  fraud_signal: boolean;
  tags: string[];
}

export interface TriagedCase extends ConstituentCase {
  triage: TriageResult;
}

export interface PatternCluster {
  id: string;
  title: string;
  description: string;
  case_ids: string[];
  severity: "low" | "medium" | "high";
}

export interface FraudCluster extends PatternCluster {
  estimated_loss: string;
  recommended_referral: string; // e.g., "HHS-OIG", "SSA-OIG", "DOJ FCA Unit"
  evidence_pattern: string;
}

export interface PatternDetectionResult {
  operational_patterns: PatternCluster[];
  process_patterns: PatternCluster[];
  fraud_clusters: FraudCluster[];
}

export interface OIGReferralResult {
  referral_letter: string; // markdown
  evidence_bundle: string[]; // list of supporting facts
  recommended_statute: string; // e.g., "False Claims Act 31 USC § 3729"
}
