export default function OrderDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-8 bg-neutral-100 rounded w-40 mb-8" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-neutral-100 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
