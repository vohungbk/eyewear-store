export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-8 bg-neutral-100 rounded w-32 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-neutral-100 rounded-md" />
          ))}
        </div>
        <div className="h-64 bg-neutral-100 rounded-lg" />
      </div>
    </div>
  );
}
