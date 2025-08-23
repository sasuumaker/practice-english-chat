import type { SignUpFormData, FormErrors } from "../types/auth";

/**
 * 新規登録フォームのバリデーション
 */
export function validateSignUpForm(formData: SignUpFormData): FormErrors {
  const errors: FormErrors = {};

  // ユーザー名のバリデーション
  if (!formData.username) {
    errors.username = "ユーザー名は必須です";
  } else if (formData.username.length < 3) {
    errors.username = "ユーザー名は3文字以上で入力してください";
  } else if (formData.username.length > 50) {
    errors.username = "ユーザー名は50文字以内で入力してください";
  } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
    errors.username = "ユーザー名は英数字、アンダースコア、ハイフンのみ使用できます";
  }

  // メールアドレスのバリデーション
  if (!formData.email) {
    errors.email = "メールアドレスは必須です";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "有効なメールアドレスを入力してください";
  }

  // パスワードのバリデーション
  if (!formData.password) {
    errors.password = "パスワードは必須です";
  } else if (formData.password.length < 8) {
    errors.password = "パスワードは8文字以上で入力してください";
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
    errors.password = "パスワードは大文字、小文字、数字を含む必要があります";
  }

  // パスワード確認のバリデーション
  if (!formData.confirmPassword) {
    errors.confirmPassword = "パスワード確認は必須です";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "パスワードが一致しません";
  }

  return errors;
}

/**
 * バリデーションエラーがあるかチェック
 */
export function hasValidationErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}
