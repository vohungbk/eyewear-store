export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex gap-2 mb-6">
        {[48, 32, 64, 32, 80].map((w, i) => (
          <div key={i} className={`h-3 bg-neutral-100 rounded`} style={{ width: w }} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Gallery skeleton */}
        <div className="space-y-3">
          <div className="aspect-square rounded-xl bg-neutral-100" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-16 h-16 rounded-md bg-neutral-100" />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div className="space-y-5">
          <div className="h-3 bg-neutral-100 rounded w-20" />
          <div className="h-8 bg-neutral-100 rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-3 bg-neutral-100 rounded" />
            <div className="h-3 bg-neutral-100 rounded" />
            <div className="h-3 bg-neutral-100 rounded w-2/3" />
          </div>
          <div className="h-8 bg-neutral-100 rounded w-32" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-24 bg-neutral-100 rounded-md" />
            ))}
          </div>
          <div className="h-12 bg-neutral-100 rounded-md" />
        </div>
      </div>
    </div>
  );
}
