export interface Driver {
  _id: any;
  name: string;
  email: string;
  phone: string;
  user:any;
  licenseNumber: string;
  licenseExpiry: Date;
  status: string; // Available, On Mission, On Leave, Inactive
  experience: number; // in years
  profileImage?: string;
  notes?: string;
}


