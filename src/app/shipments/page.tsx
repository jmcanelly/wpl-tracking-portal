"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Shipment = {
  shipment_id: string;
  hawb: string | null;
  mawb: string | null;
  po_number: string | null;
  customer_reference: string | null;
  origin: string | null;
  destination: string | null;
  current_status: string | null; // may be null or inconsistent
  eta_updated: string | null;
  last_event_time: string | null;
};

type SortKey =
  | "reference"
  | "route"
  | "status"
  | "eta_updated"
  | "last_event_time";

type SortDir = "asc" | "desc";

function asLower(v: unknown) {
  return String(v ?? "").toLowerCase();
}

function parseDateMs(v: string | null) {
  if (!v) return Number.NaN;
  const d = new Date(v);
  const t = d.getTime();
  return Number.isNaN(t) ? Number.NaN : t;
}

function getReference(s: Shipment) {
  return s.hawb || s.mawb || s.po_number || s.shipment_id;
}

function getRoute(s: Shipment) {
  return `${s.origin ?? ""}→${s.destination ?? ""}`;
}

/**
 * Derive a clean status for display & sorting.
 * Goal: if something is delivered, never show “In progress”.
 * We intentionally avoid guessing from dates; we normalize from current_status text only.
 */
type DerivedStatus =
  | "Delivered"
  | "Customs Released"
  | "Discharged"
  | "In Transit"
  | "Pre-Departure";

function deriveStatus(s: Shipment): DerivedStatus {
  const raw = (s.current_status ?? "").trim().toLowerCase();

  // Normalize common variants
  if (raw.includes("deliver")) return "Delivered";
  if (raw.includes("custom") && (raw.includes("release") || raw.includes("cleared")))
    return "Customs Released";
  if (raw.includes("discharg")) return "Discharged";

  // If your pipeline ever writes these explicitly, respect them:
  if (raw.includes("in transit") || raw.includes("transit")) return "In Transit";
  if (raw.includes("pre") || raw.includes("booked") || raw.includes("ready"))
    return "Pre-Departure";

  // If current_status is blank/unknown, choose a safe default for air shipments
  // (better than “In progress”, and it’s what users expect)
  return "In Transit";
}

function statusBadgeClasses(status: DerivedStatus) {
  switch (status) {
    case "Delivered":
      return "bg-green-100 text-green-700";
    case "Customs Released":
      return "bg-amber-100 text-amber-800";
    case "Discharged":
      return "bg-purple-100 text-purple-700";
    case "Pre-Departure":
      return "bg-slate-100 text-slate-700";
    case "In Transit":
    default:
      return "bg-[var(--wpl-blue)]/10 text-[var(--wpl-blue)]";
  }
}

export default function ShipmentsPage() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string>("");

  const [sortKey, setSortKey] = useState<SortKey>("last_event_time");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        window.location.href = "/login";
        return;
      }

      setEmail(session.user.email ?? "");

      const { data, error } = await supabase
        .from("shipments")
        .select(
          "shipment_id, hawb, mawb, po_number, customer_reference, origin, destination, current_status, eta_updated, last_event_time"
        )
        .order("last_event_time", { ascending: false })
        .limit(300);

      setLoading(false);

      if (error) {
        console.error(error);
        return;
      }

      setRows((data ?? []) as Shipment[]);
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function toggleSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(nextKey);
      // sensible defaults
      setSortDir(
        nextKey === "reference" || nextKey === "route" || nextKey === "status"
          ? "asc"
          : "desc"
      );
    }
  }

  const filteredAndSorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = rows;
    if (q) {
      list = rows.filter((s) =>
        [s.hawb, s.mawb, s.po_number, s.customer_reference, s.shipment_id]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }

    const dirMul = sortDir === "asc" ? 1 : -1;

    const sorted = [...list].sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";

      switch (sortKey) {
        case "reference":
          av = asLower(getReference(a));
          bv = asLower(getReference(b));
          break;

        case "route":
          av = asLower(getRoute(a));
          bv = asLower(getRoute(b));
          break;

        case "status":
          av = asLower(deriveStatus(a));
          bv = asLower(deriveStatus(b));
          break;

        case "eta_updated": {
          const ams = parseDateMs(a.eta_updated);
          const bms = parseDateMs(b.eta_updated);
          // push missing dates to bottom
          if (Number.isNaN(ams) && Number.isNaN(bms)) return 0;
          if (Number.isNaN(ams)) return 1;
          if (Number.isNaN(bms)) return -1;
          av = ams;
          bv = bms;
          break;
        }

        case "last_event_time": {
          const ams = parseDateMs(a.last_event_time);
          const bms = parseDateMs(b.last_event_time);
          if (Number.isNaN(ams) && Number.isNaN(bms)) return 0;
          if (Number.isNaN(ams)) return 1;
          if (Number.isNaN(bms)) return -1;
          av = ams;
          bv = bms;
          break;
        }

        default:
          av = 0;
          bv = 0;
      }

      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * dirMul;
      }
      return String(av).localeCompare(String(bv)) * dirMul;
    });

    return sorted;
  }, [rows, query, sortKey, sortDir]);

  function Th({
    label,
    k,
  }: {
    label: string;
    k: SortKey;
  }) {
    const active = sortKey === k;
    const arrow = active ? (sortDir === "asc" ? "▲" : "▼") : "";
    return (
      <th className="px-4 py-3">
        <button
          type="button"
          onClick={() => toggleSort(k)}
          className={`inline-flex items-center gap-2 font-semibold hover:underline ${
            active ? "text-[var(--wpl-blue)]" : ""
          }`}
        >
          {label} <span className="text-xs opacity-70">{arrow}</span>
        </button>
      </th>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--wpl-border)] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Track Shipments</h1>
          <p className="text-sm text-[var(--wpl-gray)]">
            Search by HAWB, MAWB, PO, reference, or WPL ID
          </p>
          {email && (
            <p className="mt-1 text-xs text-[var(--wpl-gray)]">
              Signed in as {email}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            className="w-full rounded-lg border border-[var(--wpl-border)] px-3 py-2 text-sm md:w-80"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={signOut}
            className="rounded-lg bg-black/5 px-3 py-2 text-sm font-semibold hover:bg-black/10"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--wpl-border)] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[var(--wpl-bg)] text-left">
            <tr>
              <Th label="Reference" k="reference" />
              <Th label="Route" k="route" />
              <Th label="Status" k="status" />
              <Th label="ETA" k="eta_updated" />
              <Th label="Last Update" k="last_event_time" />
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--wpl-gray)]">
                  Loading shipments…
                </td>
              </tr>
            ) : filteredAndSorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--wpl-gray)]">
                  No shipments found.
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((s) => {
                const status = deriveStatus(s);

                return (
                  <tr key={s.shipment_id} className="border-t hover:bg-black/[0.02]">
                    <td className="px-4 py-3 font-medium">
                      <Link
                        className="text-[var(--wpl-blue)] hover:underline"
                        href={`/shipments/${encodeURIComponent(s.shipment_id)}`}
                      >
                        {getReference(s)}
                      </Link>
                      <div className="text-xs text-[var(--wpl-gray)]">
                        ID: {s.shipment_id}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {s.origin ?? "—"} → {s.destination ?? "—"}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClasses(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {s.eta_updated ? new Date(s.eta_updated).toLocaleDateString() : "—"}
                    </td>

                    <td className="px-4 py-3">
                      {s.last_event_time
                        ? new Date(s.last_event_time).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-[var(--wpl-gray)]">
        Showing {filteredAndSorted.length} of {rows.length} shipments (latest 300 loaded)
      </div>
    </div>
  );
}
