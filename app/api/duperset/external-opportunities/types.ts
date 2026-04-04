export type OpportunityCategory = 'Internship' | 'Full-Time' | 'Research' | 'Fellowship' | 'Part-Time' | 'Project';

export type Opportunity = {
  id: number;
  created_at: string;
  submitter_email: string | null;
  title: string | null;
  recruiting_body: string | null;
  deadline: string | null;
  jd_link: string | null;
  isRolling: boolean | null;
  role: string | null;
  category: OpportunityCategory | null;
  compensation: string | null;
  duration: string | null;
  eligibility: string | null;
  skills: string[] | null;
  apply_url: string | null;
  jd_storage_path: string | null;
  is_active: boolean;
  archived_at: string | null;
};
