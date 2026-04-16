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
import { toast } from "sonner";
import { createClientAction } from "./actions";
import type { ClientFormData } from "@/lib/validation/clients";
import { Plus, Loader2 } from "lucide-react";

const emptyForm: ClientFormData = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  businessNumber: "",
  address: "",
  status: "prospect",
  memo: "",
};

export function ClientCreateDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ClientFormData>(emptyForm);
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof ClientFormData>(key: K, value: ClientFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createClientAction(form);
      if (result.success) {
        toast.success("고객이 등록되었습니다");
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
            고객 등록
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>새 고객 등록</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">회사명 *</Label>
              <Input
                value={form.companyName}
                onChange={(e) => update("companyName", e.target.value)}
                placeholder="(주)회사명"
                required
              />
            </div>
            <div>
              <Label className="mb-1.5 block">담당자</Label>
              <Input
                value={form.contactName}
                onChange={(e) => update("contactName", e.target.value)}
                placeholder="홍길동"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">이메일</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="contact@company.com"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">전화번호</Label>
              <Input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="010-0000-0000"
              />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">메모</Label>
            <Textarea
              value={form.memo}
              onChange={(e) => update("memo", e.target.value)}
              placeholder="고객에 대한 참고 사항..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              등록
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
