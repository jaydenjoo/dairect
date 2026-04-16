"use client";

import { useState, useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { addNoteAction, deleteNoteAction } from "../actions";
import { Loader2, Trash2, Send } from "lucide-react";

interface Note {
  id: string;
  content: string;
  createdAt: Date | null;
}

interface ClientNotesProps {
  clientId: string;
  initialNotes: Note[];
}

export function ClientNotes({ clientId, initialNotes }: ClientNotesProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  // [MEDIUM 6] optimistic UI로 즉시 반영
  const [optimisticNotes, addOptimisticNote] = useOptimistic(
    initialNotes,
    (state: Note[], action: { type: "add"; note: Note } | { type: "delete"; id: string }) => {
      if (action.type === "add") return [...state, action.note];
      return state.filter((n) => n.id !== action.id);
    },
  );

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    const tempNote: Note = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      createdAt: new Date(),
    };

    startTransition(async () => {
      addOptimisticNote({ type: "add", note: tempNote });
      const result = await addNoteAction(clientId, { content: content.trim() });
      if (result.success) {
        setContent("");
      } else {
        toast.error(result.error ?? "추가 실패");
      }
    });
  }

  function handleDelete(noteId: string) {
    startTransition(async () => {
      addOptimisticNote({ type: "delete", id: noteId });
      const result = await deleteNoteAction(noteId, clientId);
      if (!result.success) {
        toast.error(result.error ?? "삭제 실패");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* 메모 목록 */}
      {optimisticNotes.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          아직 메모가 없습니다
        </p>
      ) : (
        <ul className="space-y-3">
          {optimisticNotes.map((note) => (
            <li
              key={note.id}
              className="group flex items-start gap-3 rounded-lg bg-muted/30 px-4 py-3"
            >
              <p className="flex-1 text-sm text-foreground whitespace-pre-wrap">
                {note.content}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {note.createdAt
                    ? new Date(note.createdAt).toLocaleDateString("ko-KR")
                    : ""}
                </span>
                {!note.id.startsWith("temp-") && (
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="삭제"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 메모 입력 */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="메모를 입력하세요..."
          rows={2}
          className="flex-1 resize-none"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isPending || !content.trim()}
          className="shrink-0 self-end"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
