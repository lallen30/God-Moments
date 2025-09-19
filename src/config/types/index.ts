export interface LoginResponse {
  loginInfo: {
    token: string;
    user_email: string;
    user_nicename: string;
    user_display_name: string;
    [key: string]: any;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message?: string;
}
