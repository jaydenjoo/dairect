"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { ReportContent } from "@/lib/validation/report";

// Pretendard self-host (react-pdf WOFF2 미지원 → OTF, CDN 의존 제거)
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

export interface ReportPdfCompany {
  companyName: string | null;
  representativeName: string | null;
  businessNumber: string | null;
  businessPhone: string | null;
  businessEmail: string | null;
}

export interface ReportPdfData {
  projectName: string;
  clientName: string | null;
  weekStartDate: string;
  weekEndDate: string;
  milestoneProgress: {
    completed: number;
    total: number;
    percent: number | null;
  };
  generatedAt: Date | string;
  content: ReportContent;
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
  amber: "#D97706",
  amberLight: "#FEF3C7",
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
    marginBottom: 20,
    paddingBottom: 14,
    borderBottom: `2 solid ${COLOR.primary}`,
  },
  headerLeft: { flexDirection: "column" },
  headerTitle: {
    fontSize: 24,
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
  headerRight: { flexDirection: "column", alignItems: "flex-end" },
  headerMeta: { fontSize: 9, color: COLOR.textMuted, marginTop: 2 },
  headerPeriod: {
    fontSize: 11,
    fontWeight: 700,
    color: COLOR.primary,
    letterSpacing: 0.3,
  },

  infoPanel: {
    backgroundColor: COLOR.surface,
    padding: 14,
    borderRadius: 6,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoCol: { flexDirection: "column", minWidth: 120 },
  infoLabel: {
    fontSize: 8,
    color: COLOR.textMuted,
    fontWeight: 500,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  infoValue: { fontSize: 11, fontWeight: 600, color: COLOR.text },

  section: { marginTop: 14 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: COLOR.text,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: `1 solid ${COLOR.border}`,
  },

  bullet: {
    flexDirection: "row",
    marginBottom: 6,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
    color: COLOR.primary,
    fontWeight: 700,
  },
  bulletBody: { flex: 1 },
  bulletTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: COLOR.text,
    lineHeight: 1.4,
  },
  bulletDesc: {
    marginTop: 2,
    fontSize: 9,
    color: COLOR.textMuted,
    lineHeight: 1.4,
  },
  emptyLine: {
    fontSize: 9,
    color: COLOR.textFaint,
    fontStyle: "italic",
    paddingLeft: 14,
  },

  issueCard: {
    backgroundColor: COLOR.amberLight,
    borderLeft: `3 solid ${COLOR.amber}`,
    padding: 10,
    borderRadius: 4,
    marginBottom: 6,
  },
  issueTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: COLOR.text,
    marginBottom: 3,
  },
  issueDetail: {
    fontSize: 9,
    color: COLOR.text,
    lineHeight: 1.5,
  },

  summaryBox: {
    backgroundColor: COLOR.primaryLight,
    padding: 14,
    borderRadius: 6,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: COLOR.primary,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  summaryBody: {
    fontSize: 10,
    color: COLOR.text,
    lineHeight: 1.6,
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
  footerLeft: { flexDirection: "column" },
  footerLine: { fontSize: 8, color: COLOR.textFaint },
});

// ─── 유틸 ───

function formatDate(d: string): string {
  // YYYY-MM-DD → "YYYY년 M월 D일"
  const parts = d.split("-");
  if (parts.length !== 3) return d;
  return `${parts[0]}년 ${parseInt(parts[1], 10)}월 ${parseInt(parts[2], 10)}일`;
}

function formatGeneratedAt(d: Date | string): string {
  // KST 고정 수동 포맷 (Task 3-2 Hydration 교훈)
  const date = typeof d === "string" ? new Date(d) : d;
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const y = kst.getUTCFullYear();
  const mo = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const da = String(kst.getUTCDate()).padStart(2, "0");
  const hh = String(kst.getUTCHours()).padStart(2, "0");
  const mi = String(kst.getUTCMinutes()).padStart(2, "0");
  return `${y}.${mo}.${da} ${hh}:${mi}`;
}

// ─── 컴포넌트 ───

interface Props {
  report: ReportPdfData;
  company: ReportPdfCompany | null;
}

export function WeeklyReportPdf({ report, company }: Props) {
  const { content } = report;
  const progressText =
    report.milestoneProgress.percent !== null
      ? `${report.milestoneProgress.completed} / ${report.milestoneProgress.total}건 (${report.milestoneProgress.percent}%)`
      : "—";

  return (
    <Document
      title={`주간 보고서 ${report.projectName} ${report.weekStartDate}`}
      author={company?.companyName ?? "Dairect"}
      subject={`${report.projectName} 주간 진행 보고서`}
    >
      <Page size="A4" style={styles.page}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>주간 진행 보고서</Text>
            <Text style={styles.headerSubtitle}>{report.projectName}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerPeriod}>
              {formatDate(report.weekStartDate)} ~ {formatDate(report.weekEndDate)}
            </Text>
            <Text style={styles.headerMeta}>생성일 {formatGeneratedAt(report.generatedAt)}</Text>
          </View>
        </View>

        {/* 정보 패널 */}
        <View style={styles.infoPanel}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>고객사</Text>
            <Text style={styles.infoValue}>{report.clientName ?? "—"}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>프로젝트</Text>
            <Text style={styles.infoValue}>{report.projectName}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>마일스톤 진행</Text>
            <Text style={styles.infoValue}>{progressText}</Text>
          </View>
        </View>

        {/* 이번 주 완료 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>이번 주 완료</Text>
          {content.completedThisWeek.length === 0 ? (
            <Text style={styles.emptyLine}>이번 주 완료된 항목이 없습니다.</Text>
          ) : (
            content.completedThisWeek.map((item, idx) => (
              <View key={`c-${idx}`} style={styles.bullet} wrap={false}>
                <Text style={styles.bulletDot}>•</Text>
                <View style={styles.bulletBody}>
                  <Text style={styles.bulletTitle}>{item.title}</Text>
                  {item.description && (
                    <Text style={styles.bulletDesc}>{item.description}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* 다음 주 계획 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>다음 주 계획</Text>
          {content.plannedNextWeek.length === 0 ? (
            <Text style={styles.emptyLine}>다음 주 예정된 항목이 없습니다.</Text>
          ) : (
            content.plannedNextWeek.map((item, idx) => (
              <View key={`p-${idx}`} style={styles.bullet} wrap={false}>
                <Text style={styles.bulletDot}>•</Text>
                <View style={styles.bulletBody}>
                  <Text style={styles.bulletTitle}>{item.title}</Text>
                  {item.description && (
                    <Text style={styles.bulletDesc}>{item.description}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* 이슈/리스크 (있을 때만) */}
        {content.issuesRisks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>이슈 및 리스크</Text>
            {content.issuesRisks.map((item, idx) => (
              <View key={`i-${idx}`} style={styles.issueCard} wrap={false}>
                <Text style={styles.issueTitle}>{item.title}</Text>
                <Text style={styles.issueDetail}>{item.detail}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 요약 */}
        <View style={styles.summaryBox} wrap={false}>
          <Text style={styles.summaryTitle}>주간 요약</Text>
          <Text style={styles.summaryBody}>{content.summary}</Text>
        </View>

        {/* 푸터 */}
        <View style={styles.footer} fixed>
          <View style={styles.footerLeft}>
            <Text style={styles.footerLine}>
              {company?.companyName ?? "Dairect"}
              {company?.representativeName ? ` · ${company.representativeName}` : ""}
            </Text>
            {(company?.businessPhone || company?.businessEmail) && (
              <Text style={styles.footerLine}>
                {[company?.businessPhone, company?.businessEmail].filter(Boolean).join(" · ")}
              </Text>
            )}
          </View>
          <Text
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
