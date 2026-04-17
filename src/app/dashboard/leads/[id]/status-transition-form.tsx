"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { updateLeadStatusAction } from "../actions";
import {
  leadStatusLabels,
  leadStatusSchema,
  type LeadStatus,
} from "@/lib/validation/leads";

interface Props {
  leadId: string;
  currentStatus: LeadStatus;
  currentFailReason: string;
}

export function StatusTransitionForm({ leadId, currentStatus, currentFailReason }: Props) {
  const [status, setStatus] = useState<LeadStatus>(currentStatus);
  const [failReason, setFailReason] = useState(currentFailReason);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateLeadStatusAction(leadId, { status, failReason });
      if (result.success) {
        toast.success("상태가 변경되었습니다");
      } else {
        toast.error(result.error ?? "변경에 실패했습니다");
      }
    });
  }

  const isDirty = status !== currentStatus || failReason.trim() !== currentFailReason.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label className="mb-1.5 block">상태</Label>
        <Select
          value={status}
          onValueChange={(v) => {
            if (v) setStatus(v as LeadStatus);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {leadStatusSchema.options.map((s) => (
              <SelectItem key={s} value={s}>
                {leadStatusLabels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {status === "failed" && (
        <div>
          <Label className="mb-1.5 block">실패 사유 *</Label>
          <Textarea
            value={failReason}
            onChange={(e) => setFailReason(e.target.value)}
            placeholder="예산 미달, 경쟁사 선정, 연락 두절 등"
            rows={3}
            maxLength={500}
            required
          />
        </div>
      )}

      <Button type="submit" disabled={isPending || !isDirty} size="sm" className="w-full">
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        저장
      </Button>
    </form>
  );
}
