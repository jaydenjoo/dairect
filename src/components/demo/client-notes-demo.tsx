/**
 * 소통 메모 — 데모 버전 (샘플 메모 표시 + 새 메모 입력 가드)
 *
 * 실제 `ClientNotes`는 `createClientNoteAction`/`deleteClientNoteAction` 호출.
 * 데모는 고정 샘플 메모 2~3건을 고객별로 노출 + DemoSafeForm 입력 폼.
 */

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { DemoSafeButton, DemoSafeForm } from "@/lib/demo/guard";
import { MessageSquare, Trash2 } from "lucide-react";

export type DemoNote = {
  id: string;
  content: string;
  createdAt: string; // ISO date (sample fixture 고정 표시)
};

export function ClientNotesDemo({ notes }: { notes: DemoNote[] }) {
  const [draft, setDraft] = useState("");

  return (
    <div className="space-y-4">
      {/* 입력 폼 */}
      <DemoSafeForm intent="소통 메모 추가" className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="미팅 내용, 요구사항, 결정 사항 등을 기록하세요"
          className="flex-1"
        />
        <DemoSafeButton
          type="submit"
          intent="소통 메모 추가"
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          추가
        </DemoSafeButton>
      </DemoSafeForm>

      {/* 리스트 */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <MessageSquare className="h-6 w-6 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            아직 메모가 없습니다
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li
              key={note.id}
              className="flex items-start justify-between gap-3 rounded-lg bg-muted/20 px-3 py-2.5"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {note.content}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {note.createdAt}
                </p>
              </div>
              <DemoSafeButton
                intent="소통 메모 삭제"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-destructive"
                aria-label="소통 메모 삭제"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </DemoSafeButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
