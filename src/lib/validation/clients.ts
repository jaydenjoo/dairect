import { z } from "zod";

export const clientFormSchema = z.object({
  companyName: z.string().min(1, "회사명을 입력해주세요").max(100),
  contactName: z.string().max(50).optional().default(""),
  email: z.string().email("올바른 이메일을 입력해주세요").or(z.literal("")).optional().default(""),
  phone: z.string().max(20).optional().default(""),
  businessNumber: z.string().max(12).optional().default(""),
  address: z.string().max(200).optional().default(""),
  status: z
    .enum(["prospect", "active", "completed", "returning"])
    .optional()
    .default("prospect"),
  memo: z.string().max(1000).optional().default(""),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;

export const clientNoteSchema = z.object({
  content: z.string().min(1, "내용을 입력해주세요").max(2000),
});

export type ClientNoteData = z.infer<typeof clientNoteSchema>;
