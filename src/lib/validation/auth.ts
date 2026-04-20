import { z } from "zod";

// Phase 5 Epic 5-2 Task 5-2-0: 회원가입 폼 검증.
//
// 정책:
//   - email: RFC 준수 + 200자 제한 (login.tsx와 동일)
//   - password: 8자 이상, 200자 이하 (Supabase 기본 + DoS 회피)
//   - confirmPassword: password와 일치 (refine)
//   - name: 선택. 제공되면 1~50자, trim.
//
// Supabase가 실제 password strength를 검증 (config.toml auth.password_min_length).
// 여기선 UX 수준 방어선만 — 사용자가 폼 제출 전 즉시 피드백.
export const signupFormSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("올바른 이메일 형식이 아닙니다")
      .max(200, "이메일이 너무 깁니다"),
    password: z
      .string()
      .min(8, "비밀번호는 8자 이상이어야 합니다")
      .max(200, "비밀번호가 너무 깁니다"),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요"),
    name: z
      .string()
      .trim()
      .min(1, "이름을 입력해주세요")
      .max(50, "이름이 너무 깁니다")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "비밀번호가 일치하지 않습니다",
  });

export type SignupFormData = z.infer<typeof signupFormSchema>;
