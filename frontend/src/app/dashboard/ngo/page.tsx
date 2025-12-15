"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../components/AuthContext";
import {
  createCause,
  fetchMyCauses,
  type Cause,
} from "../../../lib/api";

export default function NgoDashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loadingCauses, setLoadingCauses] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    requiredAmount: "",
    location: "",
    volunteersRequired: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "ngo") {
      router.replace("/dashboard/volunteer");
      return;
    }
    loadCauses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  async function loadCauses() {
    setLoadingCauses(true);
    try {
      const data = await fetchMyCauses();
      setCauses(data.causes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCauses(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const requiredAmount = Number(form.requiredAmount);
      const volunteersRequired = form.volunteersRequired
        ? Number(form.volunteersRequired)
        : undefined;

      if (!Number.isFinite(requiredAmount) || requiredAmount <= 0) {
        throw new Error("Required amount must be a positive number");
      }

      await createCause({
        title: form.title,
        description: form.description,
        requiredAmount,
        location: form.location || undefined,
        volunteersRequired,
      });

      setForm({
        title: "",
        description: "",
        requiredAmount: "",
        location: "",
        volunteersRequired: "",
      });
      loadCauses();
    } catch (err: any) {
      setError(err.message || "Could not create cause");
    } finally {
      setCreating(false);
    }
  }

  if (!user && !loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold text-emerald-300">
              TrustChain • NGO dashboard
            </p>
            <p className="text-xs text-zinc-400">
              Signed in as {user?.name} ({user?.email})
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-200 hover:border-zinc-400"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8 md:flex-row">
        <section className="w-full md:w-1/2">
          <h2 className="text-sm font-semibold">Create a new cause</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Describe the project, required funds, and volunteers needed. This
            will show up on the public feed for volunteers and donors.
          </p>

          <form
            onSubmit={handleCreate}
            className="mt-4 space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm"
          >
            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Title</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Description</label>
              <textarea
                required
                rows={3}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-zinc-300">
                  Required amount (₹)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  value={form.requiredAmount}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      requiredAmount: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-300">
                  Volunteers needed (optional)
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  value={form.volunteersRequired}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      volunteersRequired: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-300">
                Location (city / area)
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
              />
            </div>

            {error && (
              <p className="text-xs text-red-400" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={creating}
              className="mt-2 flex w-full items-center justify-center rounded-lg bg-emerald-500 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {creating ? "Creating…" : "Publish cause"}
            </button>
          </form>
        </section>

        <section className="w-full md:w-1/2">
          <h2 className="text-sm font-semibold">Your causes</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Track volunteers and donations for each campaign.
          </p>

          <div className="mt-4 space-y-3">
            {loadingCauses ? (
              <p className="text-xs text-zinc-400">Loading causes…</p>
            ) : !causes.length ? (
              <p className="text-xs text-zinc-400">
                No causes yet. Create your first campaign on the left.
              </p>
            ) : (
              causes.map((cause) => (
                <div
                  key={cause._id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-xs"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-100">
                        {cause.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-[11px] text-zinc-400">
                        {cause.description}
                      </p>
                      {cause.location && (
                        <p className="mt-1 text-[11px] text-zinc-500">
                          📍 {cause.location}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-[11px]">
                      <p className="text-emerald-300">
                        ₹{cause.currentAmount.toLocaleString()}{" "}
                        <span className="text-zinc-500">
                          / ₹{cause.requiredAmount.toLocaleString()}
                        </span>
                      </p>
                      <p className="mt-1 text-zinc-500">
                        {(cause.volunteers && cause.volunteers.length) || 0}{" "}
                        volunteers
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}


