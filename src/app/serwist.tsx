"use client";

// "use client" 경계를 Server Component인 layout.tsx에서 격리하기 위한 thin wrapper.
// layout.tsx가 직접 @serwist/next/react를 import하면 layout 전체가 client 경계로
// 끌려들어감. 이 재수출이 경계를 1줄로 최소화.
export { SerwistProvider } from "@serwist/next/react";
