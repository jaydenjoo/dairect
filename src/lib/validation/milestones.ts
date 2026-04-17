import { z } from "zod";
import { guardSingleLine, guardMultiLine } from "./shared-text";

export const milestoneFormSchema = z.object({
  title: guardSingleLine(z.string().min(1, "제목을 입력해주세요").max(200), "제목"),
  description: guardMultiLine(z.string().max(1000), "설명").optional().default(""),
  dueDate: z
    .union([
      z.literal(""),
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다"),
    ])
    .optional()
    .default(""),
});

export type MilestoneFormData = z.infer<typeof milestoneFormSchema>;
