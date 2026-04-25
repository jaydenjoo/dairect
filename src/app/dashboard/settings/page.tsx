import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { workspaces, workspaceSettings } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import { getCurrentWorkspaceId } from "@/lib/auth/get-workspace-id";
import { getCurrentWorkspaceRole } from "@/lib/auth/get-workspace-role";
import { getSettings } from "./actions";
import { SettingsForm } from "./settings-form";
import { LogoUpload } from "./logo-upload";
import { SiteFlagsCard } from "./site-flags-card";
import type { SettingsFormData } from "@/lib/validation/settings";

export const metadata: Metadata = {
  title: "설정",
};

const defaultSettings: SettingsFormData = {
  companyName: "",
  representativeName: "",
  businessNumber: "",
  businessAddress: "",
  businessPhone: "",
  businessEmail: "",
  bankInfo: { bankName: "", accountNumber: "", accountHolder: "" },
  estimateNumberPrefix: "EST",
  contractNumberPrefix: "CON",
  invoiceNumberPrefix: "INV",
  dailyRate: 700000,
  defaultPaymentSplit: [
    { label: "착수금", percentage: 30 },
    { label: "중도금", percentage: 40 },
    { label: "잔금", percentage: 30 },
  ],
};

export default async function SettingsPage() {
  // Phase 5 Task 5-2-2: owner/admin만 접근. member는 대시보드로 리다이렉트.
  const userId = await getUserId();
  if (!userId) redirect("/login");
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) redirect("/dashboard");
  const role = await getCurrentWorkspaceRole(userId, workspaceId);
  if (role !== "owner" && role !== "admin") redirect("/dashboard");

  const settings = await getSettings();

  // Task 5-2-2c: 현재 workspace의 로고 URL 조회 (LogoUpload 컴포넌트 초기값).
  const [ws] = await db
    .select({ logoUrl: workspaces.logoUrl })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);
  const initialLogoUrl = ws?.logoUrl ?? null;

  // Site flags — 공개 영역 노출 토글 (현재 PWA install prompt)
  const [flags] = await db
    .select({
      pwaInstallPromptEnabled: workspaceSettings.pwaInstallPromptEnabled,
    })
    .from(workspaceSettings)
    .where(eq(workspaceSettings.workspaceId, workspaceId))
    .limit(1);
  const initialPwaEnabled = flags?.pwaInstallPromptEnabled ?? false;

  return (
    <div className="py-10">
      <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
        설정
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        사업자 정보와 견적서 기본값을 관리합니다
      </p>

      <div className="mt-8 max-w-2xl space-y-10">
        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            워크스페이스 로고
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            견적서·계약서·청구서 PDF와 대시보드에 표시됩니다
          </p>
          <div className="mt-4">
            <LogoUpload initialLogoUrl={initialLogoUrl} />
          </div>
        </section>

        <SettingsForm initialData={settings ?? defaultSettings} />

        {/* Epic Site-Flags (2026-04-25): 공개 영역 노출 토글 */}
        <SiteFlagsCard initialPwaEnabled={initialPwaEnabled} />
      </div>
    </div>
  );
}
