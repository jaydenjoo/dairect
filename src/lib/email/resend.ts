import { Resend } from "resend";
import { renderInvitationEmail, type InvitationEmailInput } from "./templates/invitation";

// Phase 5 Task 5-2-4: Resend 클라이언트 singleton + workspace 초대 이메일 발송 헬퍼.
//
// 환경변수 설계 (2026-04-21):
//   RESEND_API_KEY       — 필수. 미설정 시 sendInvitationEmail throw → Server Action catch에서 에러 반환.
//   RESEND_FROM_EMAIL    — 필수. Resend가 도메인 소유 인증한 발신자.
//                          현재 사용값(2026-04-22 verified): 'Dairect <invite@send.dairect.kr>'
//                          ("Name <email>" 형식 권장 — inbox에 Dairect 표시).
//                          과거 sandbox: 'onboarding@resend.dev' — Jayden 본인 email만 수신 가능했음.
//   RESEND_REPLY_TO      — 선택. 수신자 "답장" 시 도착할 주소 (verified 불필요).
//                          Gmail 등 외부 주소 가능. 예: 'hidream72@gmail.com'.
//
// Singleton 패턴: process 단위 1회 생성. Next.js server runtime에서 warm start 재사용.

let cached: Resend | null = null;
function getClient(): Resend {
  if (cached) return cached;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");
  cached = new Resend(apiKey);
  return cached;
}

export async function sendInvitationEmail(input: InvitationEmailInput): Promise<void> {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) throw new Error("RESEND_FROM_EMAIL not configured");
  const replyTo = process.env.RESEND_REPLY_TO || undefined;

  const { subject, html, text } = renderInvitationEmail(input);
  const resend = getClient();

  const { error } = await resend.emails.send({
    from,
    to: input.to,
    replyTo,
    subject,
    html,
    text,
  });

  if (error) {
    // 수신자 email은 로그에 남기지 않음 (PII 최소화). 에러 타입/짧은 메시지만.
    console.error("[sendInvitationEmail]", {
      name: error.name,
      message: error.message?.slice(0, 200),
    });
    throw new Error(`Resend API error: ${error.name}`);
  }
}
