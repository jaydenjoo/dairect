import { redirect } from "next/navigation";

/**
 * v1: 작성만 가능. 진입 시 새 글 작성 페이지로 즉시 redirect.
 * v2(미래): 글 목록 + 수정 진입.
 */
export default function JournalIndexPage(): never {
  redirect("/dashboard/journal/new");
}
