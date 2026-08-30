export interface LoginRequest {
  userName: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  confirmPassword: string;
}

export interface AuthUser {
  id: string;
  userName: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
}

export interface ValidationProblem {
  title?: string;
  errors?: Record<string, string[]>;
}
