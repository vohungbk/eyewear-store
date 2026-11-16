export default function EyeglassesLoading() {
  return (
    <div className="mx-auto flex max-w-[1512px] animate-pulse">
      <div className="hidden w-72 shrink-0 space-y-4 border-r border-neutral-200 px-7 py-6 lg:block">
        <div className="h-3 w-32 rounded bg-neutral-100" />
        <div className="h-7 w-36 rounded bg-neutral-100" />
        <div className="h-16 rounded bg-neutral-100" />
      </div>
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-6">
        <div className="mb-4 h-5 w-40 rounded bg-neutral-100" />
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[4/3] rounded-lg bg-neutral-100" />
              <div className="h-4 w-1/2 rounded bg-neutral-100" />
              <div className="h-10 rounded-full bg-neutral-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
