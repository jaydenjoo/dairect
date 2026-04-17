"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { InvoiceType } from "@/lib/validation/invoices";
import { invoiceTypeLabels } from "@/lib/validation/invoices";
import type { BankInfo } from "@/lib/validation/settings";

// Pretendard self-host (CDN 의존 제거 — Task 2-2 교훈)
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

export interface InvoicePdfData {
  invoiceNumber: string;
  type: InvoiceType;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  issuedDate: string | null;
  dueDate: string | null;
  memo: string | null;
  projectName: string | null;
  clientName: string | null;
  clientContactName: string | null;
  clientBusinessNumber: string | null;
  clientAddress: string | null;
  estimateNumber: string | null;
  estimateTitle: string | null;
}

export interface InvoicePdfCompany {
  companyName: string | null;
  representativeName: string | null;
  businessNumber: string | null;
  businessAddress: string | null;
  businessPhone: string | null;
  businessEmail: string | null;
  bankInfo: BankInfo | null;
}

// ─── 색상 토큰 (DESIGN.md "Intelligent Sanctuary") ───

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
  headerTitle: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: -0.5,
    color: COLOR.text,
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 11,
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

  twoCol: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  panel: {
    flex: 1,
    backgroundColor: COLOR.surface,
    padding: 14,
    borderRadius: 6,
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
    width: 64,
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

  contextBox: {
    backgroundColor: COLOR.surface,
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  contextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  contextLabel: {
    fontSize: 9,
    color: COLOR.textMuted,
    fontWeight: 500,
  },
  contextValue: {
    fontSize: 10,
    color: COLOR.text,
    fontWeight: 500,
  },

  amountTable: {
    marginTop: 6,
    borderTop: `1 solid ${COLOR.border}`,
    borderBottom: `2 solid ${COLOR.text}`,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottom: `0.5 solid ${COLOR.border}`,
  },
  amountLabel: {
    fontSize: 11,
    color: COLOR.textMuted,
    fontWeight: 500,
  },
  amountValue: {
    fontSize: 12,
    color: COLOR.text,
    fontWeight: 500,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: COLOR.primaryLight,
  },
  totalLabel: {
    fontSize: 13,
    color: COLOR.text,
    fontWeight: 700,
  },
  totalValue: {
    fontSize: 16,
    color: COLOR.primary,
    fontWeight: 700,
  },

  bankBox: {
    marginTop: 16,
    padding: 14,
    backgroundColor: COLOR.surface,
    borderRadius: 6,
    borderLeft: `3 solid ${COLOR.primary}`,
  },
  bankLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: COLOR.primary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  bankValue: {
    fontSize: 11,
    fontWeight: 600,
    color: COLOR.text,
  },
  bankSub: {
    marginTop: 3,
    fontSize: 9,
    color: COLOR.textMuted,
  },

  memo: {
    marginTop: 14,
    padding: 12,
    backgroundColor: COLOR.surface,
    borderRadius: 6,
    fontSize: 9,
    lineHeight: 1.5,
    color: COLOR.textMuted,
  },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTop: `0.5 solid ${COLOR.border}`,
    fontSize: 8,
    color: COLOR.textFaint,
  },
});

function formatKRW(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  return `${amount.toLocaleString("ko-KR")}원`;
}

function formatDate(d: string | Date | null): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

interface Props {
  invoice: InvoicePdfData;
  company: InvoicePdfCompany | null;
}

export function InvoicePdf({ invoice, company }: Props) {
  const bank = company?.bankInfo;
  const hasBank =
    bank &&
    (bank.bankName || bank.accountNumber || bank.accountHolder);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>청구서</Text>
            <Text style={styles.headerSubtitle}>
              Invoice · {invoiceTypeLabels[invoice.type]}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerNumber}>{invoice.invoiceNumber}</Text>
            <Text style={styles.headerMeta}>
              발행일 {formatDate(invoice.issuedDate)}
            </Text>
            <Text style={styles.headerMeta}>
              지급기한 {formatDate(invoice.dueDate)}
            </Text>
          </View>
        </View>

        {/* 공급자 / 공급받는자 */}
        <View style={styles.twoCol}>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>공급자</Text>
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
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>공급받는자</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>회사명</Text>
              <Text style={styles.infoValue}>
                {invoice.clientName ?? "—"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>담당자</Text>
              <Text style={styles.infoValue}>
                {invoice.clientContactName ?? "—"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>사업자번호</Text>
              <Text style={styles.infoValue}>
                {invoice.clientBusinessNumber ?? "—"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>주소</Text>
              <Text style={styles.infoValue}>
                {invoice.clientAddress ?? "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* 청구 내역 */}
        <Text style={styles.sectionTitle}>청구 내역</Text>
        <View style={styles.contextBox}>
          <View style={styles.contextRow}>
            <Text style={styles.contextLabel}>프로젝트명</Text>
            <Text style={styles.contextValue}>
              {invoice.projectName ?? "—"}
            </Text>
          </View>
          <View style={styles.contextRow}>
            <Text style={styles.contextLabel}>청구 구분</Text>
            <Text style={styles.contextValue}>
              {invoiceTypeLabels[invoice.type]}
            </Text>
          </View>
          {invoice.estimateNumber && (
            <View style={styles.contextRow}>
              <Text style={styles.contextLabel}>참조 견적서</Text>
              <Text style={styles.contextValue}>
                {invoice.estimateNumber}
                {invoice.estimateTitle ? ` · ${invoice.estimateTitle}` : ""}
              </Text>
            </View>
          )}
        </View>

        {/* 금액 */}
        <View style={styles.amountTable}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>공급가액</Text>
            <Text style={styles.amountValue}>{formatKRW(invoice.amount)}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>부가세 (10%)</Text>
            <Text style={styles.amountValue}>
              {formatKRW(invoice.taxAmount)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>합계 금액</Text>
            <Text style={styles.totalValue}>
              {formatKRW(invoice.totalAmount)}
            </Text>
          </View>
        </View>

        {/* 송금 계좌 */}
        {hasBank && (
          <View style={styles.bankBox}>
            <Text style={styles.bankLabel}>송금 계좌</Text>
            <Text style={styles.bankValue}>
              {bank.bankName ?? ""}
              {bank.accountNumber ? ` · ${bank.accountNumber}` : ""}
            </Text>
            {bank.accountHolder && (
              <Text style={styles.bankSub}>예금주 · {bank.accountHolder}</Text>
            )}
          </View>
        )}

        {/* 메모 */}
        {invoice.memo && (
          <Text style={styles.memo}>{invoice.memo}</Text>
        )}

        {/* 푸터 */}
        <View style={styles.footer} fixed>
          <Text>{company?.companyName ?? ""}</Text>
          <Text>{invoice.invoiceNumber}</Text>
        </View>
      </Page>
    </Document>
  );
}
