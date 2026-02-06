import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--wpl-border)] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">WPL Shipment Tracking</h1>
        <p className="mt-2 text-[var(--wpl-gray)]">
          Sign in to search shipments by HAWB, MAWB, PO number, or customer reference.
        </p>

        <div className="mt-5 flex gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-[var(--wpl-blue)] px-4 py-2 font-semibold text-white hover:opacity-95"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
