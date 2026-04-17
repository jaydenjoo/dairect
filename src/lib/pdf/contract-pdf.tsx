"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
// estimate-pdf에서 Font.register가 수행되므로 동일 폰트 family 재사용
import "@/lib/pdf/estimate-pdf";
import type {
  EstimatePdfPaymentSplit,
  EstimatePdfCompany,
} from "@/lib/pdf/estimate-pdf";

// ─── 타입 ───

export interface ContractPdfData {
  contractNumber: string;
  createdAt: Date | string | null;
  warrantyMonths: number;
  ipOwnership: "client" | "developer" | "shared";
  liabilityLimit: number | null;
  specialTerms: string | null;

  // 견적서 스냅샷
  estimateNumber: string | null;
  estimateTitle: string | null;
  estimateTotalAmount: number | null;
  estimateSupplyAmount: number | null;
  estimateTaxAmount: number | null;
  estimatePaymentSplit: EstimatePdfPaymentSplit[];

  // 프로젝트
  projectName: string | null;
  projectStartDate: string | null;
  projectEndDate: string | null;

  // 고객
  clientName: string | null;
  clientContactName: string | null;
  clientBusinessNumber: string | null;
  clientAddress: string | null;
}

// ─── 스타일 ───

const COLOR = {
  primary: "#4F46E5",
  text: "#111827",
  textMuted: "#6B7280",
  textFaint: "#9CA3AF",
  surface: "#F9F9F7",
  border: "#E5E7EB",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Pretendard",
    fontSize: 10,
    color: COLOR.text,
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 50,
    lineHeight: 1.5,
  },
  titleBlock: {
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: `2 solid ${COLOR.primary}`,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: 2,
    color: COLOR.text,
  },
  titleSub: {
    marginTop: 8,
    fontSize: 10,
    color: COLOR.textMuted,
    letterSpacing: 1,
  },

  preamble: {
    fontSize: 10,
    lineHeight: 1.8,
    marginBottom: 14,
    textAlign: "justify",
  },

  partiesRow: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 12,
  },
  partyBox: {
    flex: 1,
    backgroundColor: COLOR.surface,
    padding: 12,
    borderRadius: 6,
  },
  partyLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: COLOR.primary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  partyField: {
    flexDirection: "row",
    marginBottom: 3,
  },
  partyFieldLabel: {
    width: 60,
    fontSize: 9,
    color: COLOR.textMuted,
  },
  partyFieldValue: {
    flex: 1,
    fontSize: 10,
    color: COLOR.text,
  },

  article: {
    marginTop: 10,
  },
  articleTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: COLOR.text,
    marginBottom: 4,
  },
  articleBody: {
    fontSize: 10,
    color: COLOR.text,
    lineHeight: 1.7,
    textAlign: "justify",
  },
  articleListItem: {
    flexDirection: "row",
    marginTop: 2,
  },
  articleListBullet: {
    width: 18,
    fontSize: 10,
  },
  articleListText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.6,
  },

  amountBlock: {
    marginTop: 6,
    marginLeft: 10,
    padding: 10,
    backgroundColor: COLOR.surface,
    borderRadius: 6,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
    fontSize: 10,
  },
  amountTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    marginTop: 4,
    borderTop: `0.5 solid ${COLOR.border}`,
    fontSize: 11,
    fontWeight: 700,
    color: COLOR.primary,
  },

  specialTermsBlock: {
    marginTop: 14,
    padding: 12,
    borderRadius: 6,
    borderLeft: `3 solid ${COLOR.primary}`,
    backgroundColor: COLOR.surface,
  },
  specialTermsTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: COLOR.primary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  specialTermsBody: {
    fontSize: 10,
    lineHeight: 1.6,
    color: COLOR.text,
  },

  signatureBlock: {
    marginTop: 30,
  },
  signatureDate: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: 500,
    marginBottom: 20,
  },
  signatureRow: {
    flexDirection: "row",
    gap: 20,
  },
  signatureCol: {
    flex: 1,
    paddingTop: 14,
    borderTop: `1 solid ${COLOR.border}`,
  },
  signatureRole: {
    fontSize: 10,
    fontWeight: 700,
    color: COLOR.text,
  },
  signatureField: {
    flexDirection: "row",
    marginTop: 8,
  },
  signatureLabel: {
    width: 60,
    fontSize: 9,
    color: COLOR.textMuted,
  },
  signatureValue: {
    flex: 1,
    fontSize: 10,
  },
  signatureSealBox: {
    marginTop: 12,
    height: 52,
    border: `0.5 dashed ${COLOR.textFaint}`,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  signatureSealText: {
    fontSize: 8,
    color: COLOR.textFaint,
  },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: COLOR.textFaint,
    borderTop: `0.5 solid ${COLOR.border}`,
    paddingTop: 8,
  },
});

// ─── 유틸 ───

function formatKRW(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  return `${amount.toLocaleString("ko-KR")}원`;
}

function formatDateKorean(d: string | Date | null | undefined): string {
  if (!d) return "____년 __월 __일";
  const date = typeof d === "string" ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}년 ${m}월 ${day}일`;
}

const ipOwnershipText: Record<ContractPdfData["ipOwnership"], string> = {
  client: "갑(고객)",
  developer: "을(공급자)",
  shared: "갑과 을 공동",
};

// ─── 컴포넌트 ───

interface ContractPdfProps {
  contract: ContractPdfData;
  company: EstimatePdfCompany | null;
}

export function ContractPdf({ contract, company }: ContractPdfProps) {
  const supplierName = company?.companyName ?? "(공급자 회사명)";
  const clientName = contract.clientName ?? "(고객사명)";
  const projectName = contract.projectName ?? "(프로젝트명)";

  return (
    <Document
      title={`계약서 ${contract.contractNumber}`}
      author={company?.companyName ?? "Dairect"}
      subject={contract.estimateTitle ?? "소프트웨어 개발 용역 계약서"}
    >
      <Page size="A4" style={styles.page}>
        {/* 제목 */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>소프트웨어 개발 용역 계약서</Text>
          <Text style={styles.titleSub}>{contract.contractNumber}</Text>
        </View>

        {/* 서문 */}
        <Text style={styles.preamble}>
          {`"${clientName}" (이하 "갑")과 "${supplierName}" (이하 "을")은 상기 표제 용역에 관하여 아래와 같이 계약을 체결한다.`}
        </Text>

        {/* 당사자 정보 */}
        <View style={styles.partiesRow}>
          {/* 갑 (고객) */}
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>갑 (발주자)</Text>
            <View style={styles.partyField}>
              <Text style={styles.partyFieldLabel}>회사명</Text>
              <Text style={styles.partyFieldValue}>
                {contract.clientName ?? "—"}
              </Text>
            </View>
            <View style={styles.partyField}>
              <Text style={styles.partyFieldLabel}>대표자</Text>
              <Text style={styles.partyFieldValue}>
                {contract.clientContactName ?? "—"}
              </Text>
            </View>
            <View style={styles.partyField}>
              <Text style={styles.partyFieldLabel}>사업자번호</Text>
              <Text style={styles.partyFieldValue}>
                {contract.clientBusinessNumber ?? "—"}
              </Text>
            </View>
            <View style={styles.partyField}>
              <Text style={styles.partyFieldLabel}>주소</Text>
              <Text style={styles.partyFieldValue}>
                {contract.clientAddress ?? "—"}
              </Text>
            </View>
          </View>

          {/* 을 (공급자) */}
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>을 (공급자)</Text>
            <View style={styles.partyField}>
              <Text style={styles.partyFieldLabel}>회사명</Text>
              <Text style={styles.partyFieldValue}>
                {company?.companyName ?? "—"}
              </Text>
            </View>
            <View style={styles.partyField}>
              <Text style={styles.partyFieldLabel}>대표자</Text>
              <Text style={styles.partyFieldValue}>
                {company?.representativeName ?? "—"}
              </Text>
            </View>
            <View style={styles.partyField}>
              <Text style={styles.partyFieldLabel}>사업자번호</Text>
              <Text style={styles.partyFieldValue}>
                {company?.businessNumber ?? "—"}
              </Text>
            </View>
            <View style={styles.partyField}>
              <Text style={styles.partyFieldLabel}>주소</Text>
              <Text style={styles.partyFieldValue}>
                {company?.businessAddress ?? "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* 제1조 */}
        <View style={styles.article} wrap={false}>
          <Text style={styles.articleTitle}>제1조 (목적)</Text>
          <Text style={styles.articleBody}>
            {`본 계약은 "${projectName}" 프로젝트의 소프트웨어 개발 용역에 관하여 갑이 을에게 위탁하고, 을이 이를 수행하는 데 필요한 제반 사항을 규정함을 목적으로 한다.`}
          </Text>
        </View>

        {/* 제2조 */}
        <View style={styles.article} wrap={false}>
          <Text style={styles.articleTitle}>제2조 (용역의 범위)</Text>
          <Text style={styles.articleBody}>
            {`을이 제공하는 용역의 구체적 범위는 별첨 "견적서(${contract.estimateNumber ?? "—"})"에 기재된 내용에 따른다. 해당 견적서는 본 계약의 일부를 구성한다.`}
          </Text>
        </View>

        {/* 제3조 */}
        <View style={styles.article} wrap={false}>
          <Text style={styles.articleTitle}>제3조 (계약금액 및 지급 방법)</Text>
          <Text style={styles.articleBody}>
            계약금액은 아래와 같으며, 명시된 수금 비율에 따라 분할 지급한다.
          </Text>
          <View style={styles.amountBlock}>
            <View style={styles.amountRow}>
              <Text>공급가액</Text>
              <Text>{formatKRW(contract.estimateSupplyAmount)}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text>부가세(10%)</Text>
              <Text>{formatKRW(contract.estimateTaxAmount)}</Text>
            </View>
            <View style={styles.amountTotalRow}>
              <Text>계약금액 (부가세 포함)</Text>
              <Text>{formatKRW(contract.estimateTotalAmount)}</Text>
            </View>
          </View>

          {contract.estimatePaymentSplit.length > 0 && (
            <View style={{ marginTop: 6, marginLeft: 10 }}>
              {contract.estimatePaymentSplit.map((split, idx) => {
                const amount = Math.round(
                  ((contract.estimateTotalAmount ?? 0) * split.percentage) / 100,
                );
                return (
                  <View key={idx} style={styles.articleListItem}>
                    <Text style={styles.articleListBullet}>
                      {idx + 1}.
                    </Text>
                    <Text style={styles.articleListText}>
                      {`${split.label}: ${split.percentage}% (${formatKRW(amount)})`}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* 제4조 */}
        <View style={styles.article} wrap={false}>
          <Text style={styles.articleTitle}>제4조 (납기)</Text>
          <Text style={styles.articleBody}>
            {`용역 수행 기간은 ${contract.projectStartDate ?? "별도 협의일"}부터 ${contract.projectEndDate ?? "별도 협의일"}까지로 한다. 다만 양 당사자 합의로 조정할 수 있다.`}
          </Text>
        </View>

        {/* 제5조 */}
        <View style={styles.article} wrap={false}>
          <Text style={styles.articleTitle}>제5조 (검수)</Text>
          <Text style={styles.articleBody}>
            을의 용역 완료 통지 후 갑은 7영업일 이내에 검수를 마쳐야 하며, 해당 기간 내 이의를 제기하지 아니한 경우 검수에 합격한 것으로 본다.
          </Text>
        </View>

        {/* 제6조 */}
        <View style={styles.article} wrap={false}>
          <Text style={styles.articleTitle}>제6조 (하자보증)</Text>
          <Text style={styles.articleBody}>
            {`검수 완료일로부터 ${contract.warrantyMonths}개월간 을은 통상적인 사용 중 발생한 하자를 무상으로 보수한다. 단, 갑의 귀책사유 또는 제3자의 개입으로 발생한 하자는 제외한다.`}
          </Text>
        </View>

        {/* 제7조 */}
        <View style={styles.article} wrap={false}>
          <Text style={styles.articleTitle}>제7조 (지식재산권)</Text>
          <Text style={styles.articleBody}>
            {`본 계약에 따라 완성된 결과물에 대한 지식재산권은 계약금액 완납과 동시에 ${ipOwnershipText[contract.ipOwnership]}에게 귀속한다. 을이 기존에 보유한 라이선스 및 오픈소스 구성요소는 해당 라이선스 조건을 따른다.`}
          </Text>
        </View>

        {/* 제8조 */}
        <View style={styles.article} wrap={false}>
          <Text style={styles.articleTitle}>제8조 (비밀유지)</Text>
          <Text style={styles.articleBody}>
            양 당사자는 본 계약 수행 과정에서 알게 된 상대방의 영업상·기술상 비밀을 제3자에게 누설하거나 본 계약의 목적 외 용도로 사용하지 아니한다. 본 조의 효력은 계약 종료 후 2년간 유지된다.
          </Text>
        </View>

        {/* 제9조 */}
        <View style={styles.article} wrap={false}>
          <Text style={styles.articleTitle}>제9조 (책임 한계)</Text>
          <Text style={styles.articleBody}>
            {contract.liabilityLimit !== null && contract.liabilityLimit !== undefined
              ? `본 계약과 관련하여 을이 갑에게 부담하는 손해배상책임의 총액은 ${formatKRW(contract.liabilityLimit)}을 초과하지 아니한다. 단, 을의 고의 또는 중대한 과실로 인한 손해는 그러하지 아니하다.`
              : "본 계약과 관련하여 을이 갑에게 부담하는 손해배상책임의 총액은 제3조에 명시된 계약금액을 초과하지 아니한다. 단, 을의 고의 또는 중대한 과실로 인한 손해는 그러하지 아니하다."}
          </Text>
        </View>

        {/* 제10조 */}
        <View style={styles.article} wrap={false}>
          <Text style={styles.articleTitle}>제10조 (계약 해지)</Text>
          <Text style={styles.articleBody}>
            양 당사자는 상대방이 본 계약을 중대하게 위반하고 14일의 시정 기간 내에 시정하지 아니한 경우 서면 통지로써 본 계약을 해지할 수 있다.
          </Text>
        </View>

        {/* 제11조 */}
        <View style={styles.article} wrap={false}>
          <Text style={styles.articleTitle}>제11조 (분쟁 해결)</Text>
          <Text style={styles.articleBody}>
            본 계약과 관련한 분쟁은 양 당사자 간 상호 협의로 해결함을 원칙으로 하며, 합의에 이르지 못한 경우 서울중앙지방법원을 제1심 관할 법원으로 한다.
          </Text>
        </View>

        {/* 특약사항 */}
        {contract.specialTerms && (
          <View style={styles.specialTermsBlock} wrap={false}>
            <Text style={styles.specialTermsTitle}>특약사항</Text>
            <Text style={styles.specialTermsBody}>{contract.specialTerms}</Text>
          </View>
        )}

        {/* 서명란 */}
        <View style={styles.signatureBlock} wrap={false}>
          <Text style={styles.signatureDate}>
            {formatDateKorean(contract.createdAt)}
          </Text>
          <View style={styles.signatureRow}>
            <View style={styles.signatureCol}>
              <Text style={styles.signatureRole}>갑 (발주자)</Text>
              <View style={styles.signatureField}>
                <Text style={styles.signatureLabel}>회사명</Text>
                <Text style={styles.signatureValue}>
                  {contract.clientName ?? "—"}
                </Text>
              </View>
              <View style={styles.signatureField}>
                <Text style={styles.signatureLabel}>대표자</Text>
                <Text style={styles.signatureValue}>
                  {contract.clientContactName ?? "—"}
                </Text>
              </View>
              <View style={styles.signatureSealBox}>
                <Text style={styles.signatureSealText}>(인)</Text>
              </View>
            </View>
            <View style={styles.signatureCol}>
              <Text style={styles.signatureRole}>을 (공급자)</Text>
              <View style={styles.signatureField}>
                <Text style={styles.signatureLabel}>회사명</Text>
                <Text style={styles.signatureValue}>
                  {company?.companyName ?? "—"}
                </Text>
              </View>
              <View style={styles.signatureField}>
                <Text style={styles.signatureLabel}>대표자</Text>
                <Text style={styles.signatureValue}>
                  {company?.representativeName ?? "—"}
                </Text>
              </View>
              <View style={styles.signatureSealBox}>
                <Text style={styles.signatureSealText}>(인)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 푸터 */}
        <View style={styles.footer} fixed>
          <Text>{company?.companyName ?? "Dairect"}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
