import { z } from "zod";
import { guardSingleLine, guardMultiLine } from "./shared-text";

export const clientFormSchema = z.object({
  companyName: guardSingleLine(z.string().min(1, "회사명을 입력해주세요").max(100), "회사명"),
  contactName: guardSingleLine(z.string().max(50), "담당자명").optional().default(""),
  email: z.string().email("올바른 이메일을 입력해주세요").or(z.literal("")).optional().default(""),
  phone: guardSingleLine(z.string().max(20), "전화번호").optional().default(""),
  businessNumber: guardSingleLine(z.string().max(12), "사업자번호").optional().default(""),
  address: guardSingleLine(z.string().max(200), "주소").optional().default(""),
  status: z
    .enum(["prospect", "active", "completed", "returning"])
    .optional()
    .default("prospect"),
  memo: guardMultiLine(z.string().max(1000), "메모").optional().default(""),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;

export const clientNoteSchema = z.object({
  content: guardMultiLine(z.string().min(1, "내용을 입력해주세요").max(2000), "내용"),
});

export type ClientNoteData = z.infer<typeof clientNoteSchema>;
