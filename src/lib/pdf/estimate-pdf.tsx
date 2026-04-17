"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// ─── Pretendard 한글 폰트 등록 (OTF, self-host) ───
// react-pdf는 WOFF2 미지원. public/fonts/에서 직접 서빙 (CDN 의존 제거)
// 파일 출처: node_modules/pretendard/dist/public/static/
Font.register({
  family: "Pretendard",
  fonts: [
    { src: "/fonts/Pretendard-Regular.otf", fontWeight: 400 },
    { src: "/fonts/Pretendard-Medium.otf", fontWeight: 500 },
    { src: "/fonts/Pretendard-SemiBold.otf", fontWeight: 600 },
    { src: "/fonts/Pretendard-Bold.otf", fontWeight: 700 },
  ],
});

// ─── 타입 ───

export interface EstimatePdfItem {
  id: string;
  name: string;
  description: string | null;
  manDays: string | null;
  difficulty: string | null;
  unitPrice: number | null;
  quantity: number | null;
  subtotal: number | null;
}

export interface EstimatePdfPaymentSplit {
  label: string;
  percentage: number;
}

export interface EstimatePdfData {
  estimateNumber: string;
  title: string;
  validUntil: string | null;
  createdAt: Date | string | null;
  clientName: string | null;
  projectName: string | null;
  supplyAmount: number | null;
  taxAmount: number | null;
  totalAmount: number | null;
  totalDays: string | null;
  notes: string | null;
  items: EstimatePdfItem[];
  paymentSplit: EstimatePdfPaymentSplit[];
}

export interface EstimatePdfCompany {
  companyName: string | null;
  representativeName: string | null;
  businessNumber: string | null;
  businessAddress: string | null;
  businessPhone: string | null;
  businessEmail: string | null;
}

// ─── 스타일 (DESIGN.md "Intelligent Sanctuary" 토큰) ───

const COLOR = {
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
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
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: `2 solid ${COLOR.primary}`,
  },
  headerLeft: {
    flexDirection: "column",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: -0.5,
    color: COLOR.text,
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: 500,
    color: COLOR.textMuted,
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  headerNumber: {
    fontSize: 11,
    fontWeight: 700,
    color: COLOR.primary,
    letterSpacing: 0.5,
  },
  headerMeta: {
    marginTop: 4,
    fontSize: 9,
    color: COLOR.textMuted,
  },

  panel: {
    backgroundColor: COLOR.surface,
    padding: 14,
    borderRadius: 6,
    marginBottom: 12,
  },
  panelTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: COLOR.primary,
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  infoLabel: {
    width: 72,
    fontSize: 9,
    color: COLOR.textMuted,
    fontWeight: 500,
  },
  infoValue: {
    flex: 1,
    fontSize: 10,
    color: COLOR.text,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: COLOR.text,
    marginTop: 16,
    marginBottom: 8,
  },

  table: {
    width: "100%",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLOR.text,
    color: COLOR.white,
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontSize: 9,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottom: `0.5 solid ${COLOR.border}`,
  },
  tableRowZebra: {
    backgroundColor: COLOR.surface,
  },
  col_num: { width: "6%", fontSize: 9 },
  col_name: { width: "44%", fontSize: 10 },
  col_md: { width: "10%", textAlign: "right", fontSize: 10 },
  col_unit: { width: "18%", textAlign: "right", fontSize: 10 },
  col_qty: { width: "8%", textAlign: "right", fontSize: 10 },
  col_subtotal: {
    width: "14%",
    textAlign: "right",
    fontSize: 10,
    fontWeight: 500,
  },
  itemName: {
    fontSize: 10,
    fontWeight: 500,
  },
  itemDesc: {
    marginTop: 2,
    fontSize: 8,
    color: COLOR.textMuted,
  },

  twoCol: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: COLOR.surface,
    padding: 14,
    borderRadius: 6,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    fontSize: 10,
  },
  summaryLabel: {
    color: COLOR.textMuted,
  },
  summaryValue: {
    fontWeight: 500,
  },
  summaryDivider: {
    borderTop: `0.5 solid ${COLOR.border}`,
    marginVertical: 6,
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
  },
  summaryTotalLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: COLOR.text,
  },
  summaryTotalValue: {
    fontSize: 14,
    fontWeight: 700,
    color: COLOR.primary,
  },

  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  paymentLabel: {
    fontSize: 10,
    color: COLOR.textMuted,
  },
  paymentValue: {
    fontSize: 10,
    fontWeight: 500,
  },
  paymentAmount: {
    fontSize: 10,
    color: COLOR.textMuted,
    marginLeft: 8,
  },

  notes: {
    marginTop: 14,
    padding: 14,
    borderRadius: 6,
    borderLeft: `3 solid ${COLOR.primary}`,
    backgroundColor: COLOR.surface,
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: COLOR.primary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  notesBody: {
    fontSize: 10,
    lineHeight: 1.5,
    color: COLOR.text,
  },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
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
  return `₩ ${amount.toLocaleString("ko-KR")}`;
}

function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatDecimal(v: string | null): string {
  if (!v) return "—";
  const n = parseFloat(v);
  if (Number.isNaN(n)) return "—";
  return n % 1 === 0 ? n.toString() : n.toFixed(1);
}

// ─── 컴포넌트 ───

interface EstimatePdfProps {
  estimate: EstimatePdfData;
  company: EstimatePdfCompany | null;
}

export function EstimatePdf({ estimate, company }: EstimatePdfProps) {
  const hasCompany = company && (company.companyName || company.representativeName);

  return (
    <Document
      title={`견적서 ${estimate.estimateNumber}`}
      author={company?.companyName ?? "Dairect"}
      subject={estimate.title}
    >
      <Page size="A4" style={styles.page}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>견적서</Text>
            <Text style={styles.headerSubtitle}>{estimate.title}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerNumber}>{estimate.estimateNumber}</Text>
            <Text style={styles.headerMeta}>
              발행일 {formatDate(estimate.createdAt)}
            </Text>
            <Text style={styles.headerMeta}>
              유효기한 {formatDate(estimate.validUntil)}
            </Text>
          </View>
        </View>

        {/* 공급자 / 수신자 패널 */}
        <View style={styles.twoCol}>
          <View style={styles.summaryBox}>
            <Text style={styles.panelTitle}>공급자</Text>
            {hasCompany ? (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>회사명</Text>
                  <Text style={styles.infoValue}>
                    {company?.companyName ?? "—"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>대표자</Text>
                  <Text style={styles.infoValue}>
                    {company?.representativeName ?? "—"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>사업자번호</Text>
                  <Text style={styles.infoValue}>
                    {company?.businessNumber ?? "—"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>주소</Text>
                  <Text style={styles.infoValue}>
                    {company?.businessAddress ?? "—"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>연락처</Text>
                  <Text style={styles.infoValue}>
                    {company?.businessPhone ?? "—"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>이메일</Text>
                  <Text style={styles.infoValue}>
                    {company?.businessEmail ?? "—"}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={{ fontSize: 9, color: COLOR.textMuted }}>
                설정에서 사업자 정보를 입력해주세요.
              </Text>
            )}
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.panelTitle}>수신자</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>고객사</Text>
              <Text style={styles.infoValue}>{estimate.clientName ?? "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>프로젝트</Text>
              <Text style={styles.infoValue}>
                {estimate.projectName ?? "—"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>총 공수</Text>
              <Text style={styles.infoValue}>
                {formatDecimal(estimate.totalDays)} M/D
              </Text>
            </View>
          </View>
        </View>

        {/* 견적 항목 테이블 */}
        <Text style={styles.sectionTitle}>견적 항목</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={styles.col_num}>#</Text>
            <Text style={styles.col_name}>항목명</Text>
            <Text style={styles.col_md}>M/D</Text>
            <Text style={styles.col_unit}>단가</Text>
            <Text style={styles.col_qty}>수량</Text>
            <Text style={styles.col_subtotal}>소계</Text>
          </View>
          {estimate.items.map((item, idx) => (
            <View
              key={item.id}
              style={
                idx % 2 === 1
                  ? [styles.tableRow, styles.tableRowZebra]
                  : styles.tableRow
              }
              wrap={false}
            >
              <Text style={styles.col_num}>{idx + 1}</Text>
              <View style={styles.col_name}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.itemDesc}>{item.description}</Text>
                )}
              </View>
              <Text style={styles.col_md}>{formatDecimal(item.manDays)}</Text>
              <Text style={styles.col_unit}>{formatKRW(item.unitPrice)}</Text>
              <Text style={styles.col_qty}>{item.quantity ?? 1}</Text>
              <Text style={styles.col_subtotal}>
                {formatKRW(item.subtotal)}
              </Text>
            </View>
          ))}
        </View>

        {/* 금액 요약 + 수금 비율 */}
        <View style={styles.twoCol}>
          <View style={styles.summaryBox}>
            <Text style={styles.panelTitle}>금액 요약</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>공급가액</Text>
              <Text style={styles.summaryValue}>
                {formatKRW(estimate.supplyAmount)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>부가세 (10%)</Text>
              <Text style={styles.summaryValue}>
                {formatKRW(estimate.taxAmount)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryTotalRow}>
              <Text style={styles.summaryTotalLabel}>합계</Text>
              <Text style={styles.summaryTotalValue}>
                {formatKRW(estimate.totalAmount)}
              </Text>
            </View>
          </View>

          {estimate.paymentSplit.length > 0 && (
            <View style={styles.summaryBox}>
              <Text style={styles.panelTitle}>수금 비율</Text>
              {estimate.paymentSplit.map((split, idx) => (
                <View key={idx} style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>{split.label}</Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={styles.paymentValue}>{split.percentage}%</Text>
                    <Text style={styles.paymentAmount}>
                      {formatKRW(
                        Math.round(
                          ((estimate.totalAmount ?? 0) * split.percentage) /
                            100,
                        ),
                      )}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 비고 */}
        {estimate.notes && (
          <View style={styles.notes} wrap={false}>
            <Text style={styles.notesTitle}>비고</Text>
            <Text style={styles.notesBody}>{estimate.notes}</Text>
          </View>
        )}

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
