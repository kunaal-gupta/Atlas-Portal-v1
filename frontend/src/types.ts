
export interface Agent {
  userid: string;
  email: string;
  full_name: string;
  phone_number: string;
  company: string;
  access_role: string;
  professional_role: string;
  status: string;
  job_title: string;
  location: string;
  license_number: string;
  license_expiry: string | null;
  profile_photo: string;
  last_active: string | null;
  company_banner: string;
}
