"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Trash2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteRoleLabels, type InviteRole } from "@/lib/validation/invitation";
import { createInvitationAction, revokeInvitationAction } from "./actions";

// Phase 5 Task 5-2-4: /dashboard/members 클라이언트.
// - 초대 폼 (email + role 드롭다운 + 발송 버튼)
// - 멤버 목록 (현재 workspace 전체)
// - 초대 내역 (pending/accepted/revoked/expired 상태 뱃지 + pending만 취소 버튼)
//
// 타입은 server component prop으로만 전달되는 POJO — Date는 ISO string으로 직렬화.

export type MemberRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isMe: boolean;
  joinedAtIso: string;
};

export type InvitationRow = {
  id: string;
  email: string;
  role: string;
  expiresAtIso: string;
  createdAtIso: string;
  acceptedAtIso: string | null;
  revokedAtIso: string | null;
};

type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";

function computeInvitationStatus(inv: InvitationRow): InvitationStatus {
  if (inv.acceptedAtIso) return "accepted";
  if (inv.revokedAtIso) return "revoked";
  if (new Date(inv.expiresAtIso).getTime() <= Date.now()) return "expired";
  return "pending";
}

const roleLabel: Record<string, string> = {
  owner: "소유자",
  admin: "관리자",
  member: "멤버",
};

const statusLabel: Record<InvitationStatus, string> = {
  pending: "대기 중",
  accepted: "수락됨",
  revoked: "취소됨",
  expired: "만료됨",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type Props = {
  members: MemberRow[];
  invitations: InvitationRow[];
};

export function MembersClient({ members, invitations }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("member");

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("email", email);
    fd.set("role", role);
    startTransition(async () => {
      const result = await createInvitationAction(fd);
      if (result.success) {
        toast.success(`${email} 로 초대 메일을 발송했습니다`);
        setEmail("");
        setRole("member");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleRevoke(invitationId: string, invitationEmail: string) {
    startTransition(async () => {
      const result = await revokeInvitationAction(invitationId);
      if (result.success) {
        toast.success(`${invitationEmail} 초대를 취소했습니다`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-10">
      {/* 초대 폼 */}
      <section className="rounded-2xl bg-card p-6">
        <h2 className="text-base font-semibold text-foreground">새 멤버 초대</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          이메일로 초대 링크를 발송합니다. 받은 사람이 링크를 눌러 수락하면 멤버가 됩니다.
        </p>
        <form
          onSubmit={handleInvite}
          className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_180px_auto] sm:items-end"
        >
          <div>
            <Label htmlFor="invite-email">이메일</Label>
            <Input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              disabled={pending}
            />
          </div>
          <div>
            <Label htmlFor="invite-role">역할</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as InviteRole)}
              disabled={pending}
            >
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">{inviteRoleLabels.member}</SelectItem>
                <SelectItem value="admin">{inviteRoleLabels.admin}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <button
            type="submit"
            disabled={pending || !email}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            {pending ? "발송 중..." : "초대 발송"}
          </button>
        </form>
      </section>

      {/* 멤버 목록 */}
      <section>
        <h2 className="text-base font-semibold text-foreground">
          현재 멤버 ({members.length})
        </h2>
        <ul className="mt-4 space-y-2">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex flex-col gap-2 rounded-xl bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {m.name || m.email}
                  {m.isMe && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      나
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{m.email}</div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="rounded-md bg-muted px-2 py-1 font-medium text-foreground">
                  {roleLabel[m.role] ?? m.role}
                </span>
                <span className="text-muted-foreground">
                  {formatDate(m.joinedAtIso)} 참여
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 초대 내역 */}
      <section>
        <h2 className="text-base font-semibold text-foreground">
          초대 내역 ({invitations.length})
        </h2>
        {invitations.length === 0 ? (
          <p className="mt-4 rounded-xl bg-card p-8 text-center text-sm text-muted-foreground">
            아직 발송한 초대가 없습니다.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {invitations.map((inv) => {
              const status = computeInvitationStatus(inv);
              return (
                <li
                  key={inv.id}
                  className="flex flex-col gap-2 rounded-xl bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {inv.email}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>역할: {roleLabel[inv.role] ?? inv.role}</span>
                      <span>만료: {formatDate(inv.expiresAtIso)}</span>
                      <span>발송: {formatDate(inv.createdAtIso)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span
                      className={`rounded-md px-2 py-1 font-medium ${
                        status === "pending"
                          ? "bg-primary/10 text-primary"
                          : status === "accepted"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : status === "revoked"
                              ? "bg-muted text-muted-foreground"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                      }`}
                    >
                      {statusLabel[status]}
                    </span>
                    {status === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleRevoke(inv.id, inv.email)}
                        disabled={pending}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        aria-label={`${inv.email} 초대 취소`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        취소
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
