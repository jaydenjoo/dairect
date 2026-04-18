import Link from "next/link";
import { LinkIcon } from "lucide-react";

export const metadata = {
  title: "만료된 포털 링크",
};

export default function PortalInvalidPage() {
  return (
    <div className="pt-24 pb-24 md:pt-32">
      <div className="mx-auto max-w-xl px-6 text-center md:px-8">
        <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <LinkIcon className="h-6 w-6" />
        </div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          링크가 만료되었거나 유효하지 않아요
        </h1>
        <p
          className="mx-auto mt-3 max-w-md text-sm text-muted-foreground"
          style={{ wordBreak: "keep-all" }}
        >
          담당 PM이 링크를 재발급했거나 접근 기간이 끝났을 수 있습니다. 담당자에게
          새 포털 링크를 요청해주세요.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
