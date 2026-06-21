export default function GiftCardsLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 animate-pulse">
      <div className="h-4 bg-neutral-100 rounded w-24 mx-auto mb-3" />
      <div className="h-8 bg-neutral-100 rounded w-48 mx-auto mb-3" />
      <div className="h-4 bg-neutral-100 rounded w-64 mx-auto mb-10" />
      <div className="h-48 bg-neutral-100 rounded-2xl mb-10" />
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-neutral-100 rounded-lg" />
          ))}
        </div>
        <div className="h-12 bg-neutral-100 rounded-md" />
        <div className="h-12 bg-neutral-100 rounded-md" />
        <div className="h-12 bg-neutral-100 rounded-md" />
      </div>
    </div>
  );
}
