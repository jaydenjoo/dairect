// Phase 5.5 보안 강화: Next.js 공식 부팅 훅.
//
// register()는 server start 시 1회 호출 (Next.js runtime이 보장).
// 여기서 src/lib/env.ts를 import → top-level validateEnv() 실행 → 누락 시 throw.
// throw가 발생하면 register() 자체가 throw되어 server 부팅이 차단됨.
//
// nodejs runtime에서만 실행: edge runtime은 일부 env(DATABASE_URL 등)가 의미 없거나
// 다르게 주입되므로 검증 대상에서 제외.

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./lib/env");
  }
}
