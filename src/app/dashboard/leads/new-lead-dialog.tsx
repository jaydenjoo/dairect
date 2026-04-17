"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { createLeadAction } from "./actions";
import {
  leadSourceLabels,
  leadSourceSchema,
  type LeadFormData,
  type LeadSource,
} from "@/lib/validation/leads";

const emptyForm: LeadFormData = {
  name: "",
  source: "direct",
  email: "",
  phone: "",
  projectType: "",
  budgetRange: "",
  description: "",
};

export function NewLeadDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LeadFormData>(emptyForm);
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof LeadFormData>(key: K, value: LeadFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createLeadAction(form);
      if (result.success) {
        toast.success("리드가 등록되었습니다");
        setForm(emptyForm);
        setOpen(false);
      } else {
        toast.error(result.error ?? "등록에 실패했습니다");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            리드 등록
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>새 리드</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">이름 *</Label>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="홍길동 / ○○회사"
                required
                maxLength={50}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">소스 *</Label>
              <Select
                value={form.source}
                onValueChange={(v) => {
                  if (v) update("source", v as LeadSource);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="소스 선택" />
                </SelectTrigger>
                <SelectContent>
                  {leadSourceSchema.options.map((source) => (
                    <SelectItem key={source} value={source}>
                      {leadSourceLabels[source]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">이메일</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="client@example.com"
                maxLength={100}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">전화</Label>
              <Input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="010-0000-0000"
                maxLength={50}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">프로젝트 유형</Label>
              <Input
                value={form.projectType}
                onChange={(e) => update("projectType", e.target.value)}
                placeholder="쇼핑몰 / 홈페이지 / 자동화"
                maxLength={100}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">예산</Label>
              <Input
                value={form.budgetRange}
                onChange={(e) => update("budgetRange", e.target.value)}
                placeholder="500만원~1000만원"
                maxLength={100}
              />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block">메모</Label>
            <Textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="요구사항·특이사항·상담 메모..."
              rows={4}
              maxLength={2000}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              등록
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
