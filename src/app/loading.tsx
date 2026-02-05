export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* 背景装飾 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-green-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            <div>
              <div className="h-7 w-56 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>

        {/* KPI Cards Skeleton - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={`kpi-1-${i}`} />
          ))}
        </div>

        {/* KPI Cards Skeleton - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={`kpi-2-${i}`} />
          ))}
        </div>

        {/* Pipeline Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {[1, 2, 3].map((i) => (
            <SkeletonPipelineCard key={`pipeline-${i}`} />
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="mb-5">
          <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Bottom Section Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={`task-${i}`} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
            <div className="h-5 w-28 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={`link-${i}`} className="h-14 bg-gray-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-3"></div>
      <div className="h-2 w-full bg-gray-100 rounded-full mb-2">
        <div className="h-2 w-1/2 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );
}

function SkeletonPipelineCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
      <div className="h-4 w-36 bg-gray-200 rounded animate-pulse mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-6 w-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
