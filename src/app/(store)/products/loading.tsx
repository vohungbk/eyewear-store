export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="h-7 bg-neutral-100 rounded w-36 mb-2" />
      <div className="h-4 bg-neutral-100 rounded w-24 mb-6" />
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-square bg-neutral-100 rounded-lg" />
            <div className="h-4 bg-neutral-100 rounded w-3/4" />
            <div className="h-4 bg-neutral-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
