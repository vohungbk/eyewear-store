"use client";

export default function SortSelect({ value }: { value: string }) {
  return (
    <select
      defaultValue={value}
      onChange={(e) => {
        const url = new URL(window.location.href);
        url.searchParams.set("sort", e.target.value);
        url.searchParams.delete("page");
        window.location.href = url.toString();
      }}
      className="text-sm border border-neutral-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-black"
    >
      <option value="newest">Newest</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
    </select>
  );
}
