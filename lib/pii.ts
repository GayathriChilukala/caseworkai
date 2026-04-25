/**
 * Regex-based PII scrubber. Runs before every Claude call so sensitive
 * constituent data never leaves the agency network in the on-prem deployment.
 *
 * Conservative intentionally: strips SSN, full phone numbers, emails, and
 * street addresses. Leaves names and cities — names are hard without NER and
 * cities are often relevant context (which regional office handles the case).
 */

export interface ScrubResult {
  text: string;
  scrubs: Array<{ kind: string; original: string }>;
}

const SSN_RE = /\b\d{3}-\d{2}-\d{4}\b|\bSSN[:\s]+\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/gi;
const PHONE_RE = /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const STREET_RE = /\b\d{1,5}\s+(?:[A-Z][a-z]+\s?){1,4}(?:Rd|Road|St|Street|Ave|Avenue|Blvd|Boulevard|Ln|Lane|Dr|Drive|Ct|Court|Way|Pl|Place|Cir|Circle|Pkwy|Parkway)\b/g;
const DOB_RE = /\b(?:DOB|born)[:\s]+\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/gi;
const CREDIT_RE = /\b(?:\d[ -]*?){13,16}\b/g;

export function scrubPII(text: string): ScrubResult {
  const scrubs: ScrubResult["scrubs"] = [];
  let out = text;

  const replace = (re: RegExp, kind: string, token: (n: number) => string) => {
    let n = 0;
    out = out.replace(re, (match) => {
      n++;
      scrubs.push({ kind, original: match });
      return token(n);
    });
  };

  replace(SSN_RE, "SSN", (n) => `[SSN-${n}]`);
  replace(CREDIT_RE, "CREDIT", (n) => `[CARD-${n}]`);
  replace(DOB_RE, "DOB", (n) => `[DOB-${n}]`);
  replace(EMAIL_RE, "EMAIL", (n) => `[EMAIL-${n}]`);
  replace(PHONE_RE, "PHONE", (n) => `[PHONE-${n}]`);
  replace(STREET_RE, "ADDRESS", (n) => `[ADDRESS-${n}]`);

  return { text: out, scrubs };
}
