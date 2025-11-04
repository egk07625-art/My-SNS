/**
 * @file app/(main)/page.tsx
 * @description 홈 피드 페이지
 *
 * 메인 레이아웃이 적용된 홈 페이지입니다.
 * 향후 게시물 피드가 표시될 예정입니다.
 */

export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#262626]">홈 피드</h1>
      <p className="text-[#8E8E8E]">
        레이아웃 구조가 정상적으로 작동하고 있습니다.
      </p>
      <div className="bg-white rounded-lg border border-[#DBDBDB] p-6">
        <p className="text-[#262626]">
          이 페이지는 (main) Route Group에 속하며, 다음 레이아웃이 적용됩니다:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-[#8E8E8E]">
          <li>• Desktop (1024px+): Sidebar (244px) + Main Content</li>
          <li>• Tablet (768px~1024px): Sidebar (72px 아이콘만) + Main Content</li>
          <li>• Mobile (&lt;768px): Header + Main Content + BottomNav</li>
        </ul>
      </div>
    </div>
  );
}

