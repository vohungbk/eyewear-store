import type { Metadata } from "next";
import { getAdminNewsletter } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Admin — Newsletter" };

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminNewsletterPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const currentPage = parseInt(page ?? "1", 10);
  const { subscribers, count } = await getAdminNewsletter(currentPage);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Newsletter</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{count} active subscribers</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        {subscribers.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-12">No subscribers yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Email</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Name</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Source</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3 font-medium">{sub.email}</td>
                  <td className="px-5 py-3 text-neutral-600">{sub.name ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 capitalize">
                      {sub.source}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-neutral-500 text-xs">
                    {new Date(sub.subscribed_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {count > 50 && (
        <div className="flex gap-2 mt-4">
          {currentPage > 1 && (
            <a
              href={`/admin/newsletter?page=${currentPage - 1}`}
              className="text-sm px-3 py-1.5 border border-neutral-200 rounded hover:border-black transition-colors"
            >
              ← Previous
            </a>
          )}
          {count > currentPage * 50 && (
            <a
              href={`/admin/newsletter?page=${currentPage + 1}`}
              className="text-sm px-3 py-1.5 border border-neutral-200 rounded hover:border-black transition-colors"
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
