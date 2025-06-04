export interface User {
  _id: string;
  name: string;
  lastname: string;
  email: string;
  password?: string;
  role: 'admin' | 'park manager' | 'user' | 'driver';
  statuts_account: 'active' | 'inactive';
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  DriverAccountActive?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  lastname: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}