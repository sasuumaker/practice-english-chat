// 認証関連の型定義

export interface SignUpFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  message?: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  username: string;
  created_at: string;
}

// フォームバリデーション用の型
export interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}
