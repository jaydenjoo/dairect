export default function LandingPage() {
  return (
    <main className="surface-base min-h-screen">
      {/* Section 1: Nav — Glassmorphism */}
      <nav className="glass fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between px-6 md:px-12">
        <span className="font-heading text-xl font-bold text-[#4F46E5]">
          dairect
        </span>
        <div className="hidden md:flex items-center gap-8 text-sm text-[#374151]">
          <a href="/about" className="hover:text-[#4F46E5] transition-colors">서비스</a>
          <a href="/projects" className="hover:text-[#4F46E5] transition-colors">포트폴리오</a>
          <a href="/pricing" className="hover:text-[#4F46E5] transition-colors">가격</a>
          <a href="/about" className="hover:text-[#4F46E5] transition-colors">소개</a>
        </div>
        <a
          href="/about#contact"
          className="soul-gradient rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          문의하기 →
        </a>
      </nav>

      {/* Section 2: Hero */}
      <section className="pt-32 pb-20 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <span className="inline-block font-mono text-xs tracking-wider px-3 py-1.5 rounded-full bg-[#E0E7FF] text-[#4F46E5]">
              AI-Powered Development
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#111827] leading-tight tracking-tight">
              머릿속 아이디어를
              <br />
              <span className="text-[#4F46E5]">진짜로</span> 만들어드립니다
            </h1>
            <p className="text-[#6B7280] text-lg leading-relaxed max-w-lg">
              개발을 모르셔도, AI를 못 다루셔도 괜찮습니다.
              <br />
              아이디어만 말씀해주세요. 나머지는 저희가 합니다.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="/about#contact"
                className="soul-gradient rounded-lg px-6 py-3 text-white font-medium transition-opacity hover:opacity-90"
              >
                내 아이디어 상담하기 →
              </a>
              <a
                href="/projects"
                className="rounded-lg px-6 py-3 text-[#374151] font-medium transition-colors hover:bg-[#F3F3F1]"
              >
                포트폴리오 보기
              </a>
            </div>
          </div>
          <div className="flex-1 surface-low rounded-2xl p-8 shadow-ambient aspect-video flex items-center justify-center">
            <span className="text-[#9CA3AF] text-sm">3D 기기 목업 영역</span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-16 flex flex-wrap justify-center gap-12 md:gap-20">
          {[
            { value: "10+", label: "프로젝트 완료" },
            { value: "2주", label: "평균 전달 기간" },
            { value: "98%", label: "고객 만족도" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-heading text-2xl font-bold text-[#4F46E5]">
                {stat.value}
              </p>
              <p className="text-sm text-[#6B7280] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Placeholder for remaining sections */}
      <section className="surface-low py-20 px-6 text-center">
        <p className="text-[#9CA3AF] text-sm">
          Section 3~8: 문제 정의 / 프로세스 / 포트폴리오 / 가격 / CTA / Footer
          — Phase 2 Task 2-8에서 구현
        </p>
      </section>
    </main>
  );
}
