export type SkillGroup = {
  title: string;
  items: string[];
};

export type Experience = {
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
};

export type Project = {
  name: string;
  context: string;
  stack: string[];
  description: string;
};

export type Education = {
  institution: string;
  details: string;
};

export type CvData = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  portfolioUrl?: string;
  location: string;
  availability: string;
  summary: string;
  skillGroups: SkillGroup[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
  languages: string;
  profileHighlights: string[];
  closingStatement: string;
};
