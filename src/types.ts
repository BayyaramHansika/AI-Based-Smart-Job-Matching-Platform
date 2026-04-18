export type UserRole = 'seeker' | 'recruiter';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  title?: string;
  bio?: string;
  skills: string[];
  resumeUrl?: string;
  location?: string;
  experience?: string;
  education?: string;
  createdAt: string;
  updatedAt: string;
  profileStrength: number;
}

export interface JobListing {
  id: string;
  recruiterId: string;
  companyName: string;
  title: string;
  description: string;
  location: string;
  salaryRange?: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  requirements: string[];
  postedAt: string;
  expiresAt?: string;
  matchScore?: number; // Calculated per user
}

export interface JobApplication {
  id: string;
  jobId: string;
  seekerId: string;
  seekerName: string;
  jobTitle: string;
  companyName: string;
  status: 'applied' | 'reviewing' | 'interviewing' | 'offered' | 'rejected';
  appliedAt: string;
}
