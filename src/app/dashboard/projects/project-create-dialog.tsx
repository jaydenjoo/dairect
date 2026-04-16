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
import { createProjectAction } from "./actions";
import type { ProjectFormData } from "@/lib/validation/projects";
import { Plus, Loader2 } from "lucide-react";

interface ProjectCreateDialogProps {
  clientOptions: { id: string; companyName: string }[];
}

const emptyForm: ProjectFormData = {
  name: "",
  clientId: "",
  description: "",
  status: "lead",
  expectedAmount: undefined,
  startDate: "",
  endDate: "",
  memo: "",
};

export function ProjectCreateDialog({ clientOptions }: ProjectCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProjectFormData>(emptyForm);
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createProjectAction(form);
      if (result.success) {
        toast.success("프로젝트가 생성되었습니다");
        setForm(emptyForm);
        setOpen(false);
      } else {
        toast.error(result.error ?? "생성에 실패했습니다");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            프로젝트 생성
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>새 프로젝트</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <Label className="mb-1.5 block">프로젝트명 *</Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="쇼핑몰 리뉴얼"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">고객</Label>
              <Select
                value={form.clientId ?? ""}
                onValueChange={(v) => update("clientId", v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="고객 선택" />
                </SelectTrigger>
                <SelectContent>
                  {clientOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">예상 금액 (원)</Label>
              <Input
                type="number"
                value={form.expectedAmount ?? ""}
                onChange={(e) =>
                  update("expectedAmount", e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="10000000"
                min={0}
                step={100000}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">시작일</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">종료일</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => update("endDate", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block">설명</Label>
            <Textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="프로젝트에 대한 설명..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              생성
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
