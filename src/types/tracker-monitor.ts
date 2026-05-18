export type MonitorAgentConfig = {
  companies: string[];
  jobTitles: string[];
  sourceResumeId: string | null;
};

export type MonitorAgentMatch = {
  matchId: string;
  company: string;
  role: string;
  portal: string;
  jobUrl: string;
  jobDescription: string;
  detectedAt: string;
  jdAnalysis: {
    keySkills: string[];
    requiredExperience: string;
    jobLevel: string;
  };
  tailoredResumeId: string;
  tailoredResumeName: string;
  jobApplicationId: string;
};

export type MonitorAgentScanResult = {
  agentStatus: "idle" | "scanning" | "match_found";
  tick: number;
  message: string;
  match: MonitorAgentMatch | null;
};
