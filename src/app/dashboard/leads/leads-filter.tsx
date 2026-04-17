"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  leadSourceLabels,
  leadStatusLabels,
  leadSourceSchema,
  leadStatusSchema,
  type LeadSource,
  type LeadStatus,
} from "@/lib/validation/leads";
import { X } from "lucide-react";

interface Props {
  initialSource?: string;
  initialStatus?: string;
  initialQ?: string;
}

const ALL_VALUE = "all";

export function LeadsFilter({ initialSource, initialStatus, initialQ }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(initialQ ?? "");

  function updateParam(key: "source" | "status", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === ALL_VALUE || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    startTransition(() => {
      router.push(`/dashboard/leads?${params.toString()}`);
    });
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = q.trim().slice(0, 100);
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    startTransition(() => {
      router.push(`/dashboard/leads?${params.toString()}`);
    });
  }

  function clearAll() {
    setQ("");
    startTransition(() => {
      router.push("/dashboard/leads");
    });
  }

  const hasActiveFilter = !!(initialSource || initialStatus || initialQ);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={initialSource ?? ALL_VALUE}
        onValueChange={(v) => updateParam("source", v ?? ALL_VALUE)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="소스" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>전체 소스</SelectItem>
          {leadSourceSchema.options.map((source: LeadSource) => (
            <SelectItem key={source} value={source}>
              {leadSourceLabels[source]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={initialStatus ?? ALL_VALUE}
        onValueChange={(v) => updateParam("status", v ?? ALL_VALUE)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="상태" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>전체 상태</SelectItem>
          {leadStatusSchema.options.map((status: LeadStatus) => (
            <SelectItem key={status} value={status}>
              {leadStatusLabels[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <form onSubmit={submitSearch} className="flex items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="이름·이메일·전화 검색"
          maxLength={100}
          className="w-[220px]"
        />
        <Button type="submit" variant="secondary" size="sm" disabled={isPending}>
          검색
        </Button>
      </form>

      {hasActiveFilter && (
        <Button type="button" variant="ghost" size="sm" onClick={clearAll} disabled={isPending}>
          <X className="mr-1 h-3.5 w-3.5" />
          필터 초기화
        </Button>
      )}
    </div>
  );
}
