import type { Terms } from "./types.ts";

export interface VerificationSummary {
  verified: number;
  total: number;
  unverified: string[];
}

function verifiedStatus(status: string): boolean {
  return status === "primary";
}

export function verificationSummary(terms: Terms): VerificationSummary {
  const unverified: string[] = [];
  const consider = (path: string, ok: boolean): void => {
    if (!ok) unverified.push(path);
  };
  consider("dates.maturity", verifiedStatus(terms.dates.maturity.status));
  consider("dates.first_call_observation", verifiedStatus(terms.dates.first_call_observation.status));
  const schedule = terms.dates.observation_schedule;
  const scheduleVerified =
    schedule !== undefined && schedule.length > 0 && schedule.every((item) => verifiedStatus(item.status));
  consider("dates.observation_schedule", scheduleVerified);
  terms.underlyings.members.forEach((member, index) => {
    consider(`underlyings.members[${index}].initial`, verifiedStatus(member.initial.status));
  });
  consider("underlyings.performance_rounding", verifiedStatus(terms.underlyings.performance_rounding.status));
  consider("call.level", verifiedStatus(terms.call.level.status));
  consider("call.non_call_months", verifiedStatus(terms.call.non_call_months.status));
  consider("call.frequency", verifiedStatus(terms.call.frequency.status));
  consider("premium.rate_per_year", verifiedStatus(terms.premium.rate_per_year.status));
  consider("premium.accrual", verifiedStatus(terms.premium.accrual.status));
  consider("barrier.level", verifiedStatus(terms.barrier.level.status));
  consider("barrier.observation", verifiedStatus(terms.barrier.observation.status));
  consider("barrier.below_barrier", verifiedStatus(terms.barrier.below_barrier.status));
  const total = 12 + terms.underlyings.members.length;
  return { verified: total - unverified.length, total, unverified };
}
