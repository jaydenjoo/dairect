import type { Metadata } from "next";
import {
  getClientsForSelect,
  getProjectsForSelect,
  getEstimateDefaults,
} from "../actions";
import { EstimateForm } from "./estimate-form";

export const metadata: Metadata = {
  title: "새 견적서",
};

export default async function NewEstimatePage() {
  const [clientOptions, projectOptions, defaults] = await Promise.all([
    getClientsForSelect(),
    getProjectsForSelect(),
    getEstimateDefaults(),
  ]);

  return (
    <div className="py-10">
      <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
        새 견적서 작성
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        항목을 추가하고 금액을 입력하세요. 자동으로 계산됩니다.
      </p>

      <div className="mt-8">
        <EstimateForm
          clientOptions={clientOptions}
          projectOptions={projectOptions}
          defaults={defaults}
        />
      </div>
    </div>
  );
}
