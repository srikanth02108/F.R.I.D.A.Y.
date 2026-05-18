export type SimulatedPortalListing = {
  id: string;
  company: string;
  role: string;
  portal: string;
  jobUrl: string;
  jobDescription: string;
};

/** Curated demo listings simulating major career portal pipelines. */
export const SIMULATED_PORTAL_LISTINGS: SimulatedPortalListing[] = [
  {
    id: "google-swe-sr",
    company: "Google",
    role: "Senior Software Engineer",
    portal: "Google Careers",
    jobUrl: "https://careers.google.com/jobs/results/senior-software-engineer",
    jobDescription: `Senior Software Engineer — Google Cloud

We are hiring engineers who excel in distributed systems, Go, Java, and Kubernetes. You will design highly available APIs, mentor engineers, and drive reliability initiatives (SLOs, error budgets). Experience with large-scale data processing (BigQuery, Spanner) and CI/CD is required. BS/MS in Computer Science or equivalent experience.`,
  },
  {
    id: "stripe-backend",
    company: "Stripe",
    role: "Backend Engineer",
    portal: "Stripe Jobs",
    jobUrl: "https://stripe.com/jobs/listing/backend-engineer",
    jobDescription: `Backend Engineer — Payments Platform

Stripe is looking for backend engineers proficient in Ruby, Java, or Go with strong API design skills. You will build fault-tolerant payment services, improve observability (OpenTelemetry), and partner with product on merchant-facing features. 4+ years experience; fintech exposure is a plus.`,
  },
  {
    id: "meta-fullstack",
    company: "Meta",
    role: "Full Stack Engineer",
    portal: "Meta Careers",
    jobUrl: "https://www.metacareers.com/jobs/full-stack-engineer",
    jobDescription: `Full Stack Engineer — Product Engineering

Build React and GraphQL experiences used by billions. Strong TypeScript, performance optimization, and A/B experimentation skills required. Collaborate with design and data science; experience with mobile web and accessibility standards preferred.`,
  },
  {
    id: "amazon-sde2",
    company: "Amazon",
    role: "Software Development Engineer II",
    portal: "Amazon Jobs",
    jobUrl: "https://www.amazon.jobs/en/jobs/sde-ii",
    jobDescription: `SDE II — Fulfillment Technology

Design and operate microservices on AWS (Lambda, ECS, DynamoDB). Deep knowledge of Java or Python, system design, and operational excellence. Lead projects with cross-team dependencies; experience with high-throughput event pipelines valued.`,
  },
  {
    id: "microsoft-pm-eng",
    company: "Microsoft",
    role: "Software Engineer II",
    portal: "Microsoft Careers",
    jobUrl: "https://careers.microsoft.com/software-engineer-ii",
    jobDescription: `Software Engineer II — Azure

Contribute to Azure control-plane services using C# and TypeScript. Strong fundamentals in algorithms, security, and DevOps (Azure DevOps, GitHub Actions). Customer-obsessed mindset with experience shipping enterprise SaaS features.`,
  },
  {
    id: "apple-ios",
    company: "Apple",
    role: "iOS Software Engineer",
    portal: "Apple Jobs",
    jobUrl: "https://jobs.apple.com/ios-software-engineer",
    jobDescription: `iOS Software Engineer — Platform

Ship Swift/UIKit/SwiftUI features for core platform apps. Expertise in performance tuning, memory management, and XCTest. Collaborate with hardware teams; privacy-by-design experience required.`,
  },
  {
    id: "netflix-data",
    company: "Netflix",
    role: "Senior Software Engineer, Data Platform",
    portal: "Netflix Jobs",
    jobUrl: "https://jobs.netflix.com/senior-software-engineer-data",
    jobDescription: `Senior Software Engineer — Data Platform

Build streaming data pipelines (Kafka, Flink, Spark) supporting personalization. Strong Java/Scala, SQL, and cloud (AWS) skills. Operate petabyte-scale datasets with strict SLAs; mentor engineers on data quality practices.`,
  },
  {
    id: "openai-research-eng",
    company: "OpenAI",
    role: "Member of Technical Staff",
    portal: "OpenAI Careers",
    jobUrl: "https://openai.com/careers/member-of-technical-staff",
    jobDescription: `Member of Technical Staff — Applied AI

Work on LLM-powered products end-to-end: Python, PyTorch, distributed training, and production inference. Rapid prototyping, evaluation harnesses, and safety guardrails. PhD or exceptional industry track record in ML systems.`,
  },
];

function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

export function findSimulatedMatches(
  companies: string[],
  jobTitles: string[],
): SimulatedPortalListing[] {
  const companyTokens = companies.map(normalizeToken).filter(Boolean);
  const titleTokens = jobTitles.map(normalizeToken).filter(Boolean);

  if (companyTokens.length === 0 || titleTokens.length === 0) {
    return [];
  }

  return SIMULATED_PORTAL_LISTINGS.filter((listing) => {
    const companyHay = normalizeToken(listing.company);
    const roleHay = normalizeToken(listing.role);

    const companyHit = companyTokens.some(
      (token) => companyHay.includes(token) || token.includes(companyHay),
    );
    const titleHit = titleTokens.some(
      (token) => roleHay.includes(token) || token.includes(roleHay),
    );

    return companyHit && titleHit;
  });
}

/** Deterministic demo match rotation so scans surface results during live demos. */
export function pickDemoMatch(
  companies: string[],
  jobTitles: string[],
  tick: number,
): SimulatedPortalListing | null {
  const matches = findSimulatedMatches(companies, jobTitles);
  if (matches.length === 0) return null;

  if (tick < 2) return null;

  const index = (tick - 2) % matches.length;
  return matches[index] ?? null;
}
