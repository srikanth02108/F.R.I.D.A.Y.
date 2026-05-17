export type ParsedLinkedInWorkExperience = {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
};

export type ParsedLinkedInEducation = {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
};

export type ParsedLinkedInCertification = {
  name: string;
  issuer: string;
  date: string;
};

export type ParsedLinkedInProfile = {
  fullName: string | null;
  headline: string | null;
  location: string | null;
  summary: string | null;
  workExperience: ParsedLinkedInWorkExperience[];
  education: ParsedLinkedInEducation[];
  skills: string[];
  certifications: ParsedLinkedInCertification[];
};
