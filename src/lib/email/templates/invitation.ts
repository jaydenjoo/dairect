// Phase 5 Task 5-2-4: workspace 초대 이메일 템플릿 (HTML + plain text).
// DESIGN.md 2026 redesign 색 토큰을 inline style로 반영 (대부분 이메일 클라이언트 <style> 블록 제거).
//
// XSS 방어: workspaceName/inviterName/inviteUrl 등 user-supplied 텍스트는 escapeHtml 후 embed.
// template 인젝션(예: `</style><script>...</script>`) 원천 차단. URL도 escape하되 href 속성에만 사용.

export type InvitationEmailInput = {
  to: string;
  workspaceName: string;
  inviterName: string;
  inviteUrl: string;
  expiresAt: Date;
};

function escapeHtml(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// security-reviewer M1 반영 (2026-04-22): RFC 5322 헤더 인젝션 방어.
// workspaceName/inviterName이 CRLF(\r\n), NUL, line separator(U+2028/2029) 등 제어문자를
// 포함하면 Resend SDK가 Subject 헤더에 그대로 passthrough할 경우 추가 헤더로 해석될 여지.
// body는 HTML escape가 이미 걸리지만 subject는 plain text이므로 별도 sanitize 필요.
function stripHeaderControlChars(v: string): string {
  return v.replace(/[\r\n\u0000-\u001F\u007F\u2028\u2029]/g, "");
}

function formatExpiresAt(d: Date): string {
  // KST 표시. DB는 UTC 저장, 사용자 가독성 목적의 표시 전용 변환.
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(d);
}

export function renderInvitationEmail(input: InvitationEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const workspace = escapeHtml(input.workspaceName);
  const inviter = escapeHtml(input.inviterName);
  const url = escapeHtml(input.inviteUrl);
  const expires = escapeHtml(formatExpiresAt(input.expiresAt));

  // Subject는 헤더 필드 — HTML escape 대신 제어문자만 제거 (이모지/한글 정상 표기 유지).
  const safeSubjectWorkspace = stripHeaderControlChars(input.workspaceName);
  const subject = `[dairect] ${safeSubjectWorkspace} 워크스페이스 초대`;

  const text = `안녕하세요,

${input.inviterName} 님이 당신을 dairect의 "${input.workspaceName}" 워크스페이스에 초대했습니다.

아래 링크로 접속해 초대를 수락할 수 있습니다 (만료: ${formatExpiresAt(input.expiresAt)}):

${input.inviteUrl}

링크가 만료되면 초대자에게 다시 요청해 주세요.

— dairect`;

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F9F9F7;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F9F9F7;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:40px 40px 24px 40px;">
              <div style="font-size:20px;font-weight:700;letter-spacing:-0.02em;color:#4F46E5;">dairect</div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 8px 40px;">
              <h1 style="margin:0;font-size:22px;font-weight:700;letter-spacing:-0.02em;color:#111827;line-height:1.4;">
                ${workspace} 워크스페이스 초대
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 24px 40px;">
              <p style="margin:16px 0 0 0;font-size:15px;line-height:1.7;color:#111827;">
                안녕하세요,<br />
                <strong style="color:#111827;">${inviter}</strong> 님이 당신을 <strong style="color:#4F46E5;">${workspace}</strong> 워크스페이스에 초대했습니다.
              </p>
              <p style="margin:16px 0 0 0;font-size:14px;line-height:1.6;color:#6b7280;">
                아래 버튼으로 초대를 수락할 수 있습니다. 링크는 <strong>${expires}</strong>까지 유효합니다.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 40px 40px;">
              <a href="${url}"
                 style="display:inline-block;background:#4F46E5;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:-0.01em;">
                초대 수락하기
              </a>
              <p style="margin:24px 0 0 0;font-size:12px;line-height:1.6;color:#9ca3af;">
                버튼이 동작하지 않으면 아래 주소를 브라우저에 붙여넣기 하세요.<br />
                <span style="color:#6b7280;word-break:break-all;">${url}</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background:#F9F9F7;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af;">
                이 메일이 본인에게 발송되어서는 안 된다면 무시해 주세요. 링크를 사용하지 않으면 자동으로 만료됩니다.<br />
                — dairect 팀
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}
