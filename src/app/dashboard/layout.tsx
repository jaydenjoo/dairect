import type { Metadata } from "next";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export const metadata: Metadata = {
  title: {
    default: "대시보드",
    template: "%s | dairect",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col md:ml-60">
        <Header />
        <main className="flex-1 px-6 pb-20 md:px-8 md:pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}
