import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserId } from "@/lib/auth/get-user-id";
import { getCurrentWorkspaceId } from "@/lib/auth/get-workspace-id";
import { getCurrentWorkspaceRole } from "@/lib/auth/get-workspace-role";
import { getSettings } from "./actions";
import { SettingsForm } from "./settings-form";
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

  return (
    <div className="py-10">
      <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
        설정
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        사업자 정보와 견적서 기본값을 관리합니다
      </p>

      <div className="mt-8 max-w-2xl">
        <SettingsForm initialData={settings ?? defaultSettings} />
      </div>
    </div>
  );
}
