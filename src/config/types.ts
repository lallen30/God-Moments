// Type definitions for the application

// Backend type definition
export type BackendType = 'wordpress' | 'laravel';

// User profile data structure
export interface UserProfile {
  user_id: number;
  user_email: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  display_name: string;
  roles: string[];
  role: string | { id: number; name: string; role_type: string; created_at: string; updated_at: string | null };
  user_avatar: string;
  phone?: string;
  project?: string;
  company?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  about?: string;
  join_year?: string;
  token: string;
}

// Login response structure that handles both Laravel and WordPress responses
export interface LoginResponse {
  // Direct structure (Laravel style)
  loginInfo?: UserProfile;
  // Nested structure (WordPress style)
  data?: {
    loginInfo?: UserProfile;
  };
  status?: string;
  code?: number;
  error_code?: string;
  msg?: string;
}

// Auth error structure
export interface AuthError {
  response?: {
    data?: {
      message?: string;
      errormsg?: string;
    };
  };
  message?: string;
}
