"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCauses, type Cause } from "../lib/api";

export default function Home() {
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loadingCauses, setLoadingCauses] = useState(true);

  useEffect(() => {
    // Only fetch after component mounts (client-side only)
    const timer = setTimeout(() => {
      fetchCauses()
        .then((data) => {
          setCauses(data.causes.slice(0, 4));
        })
        .catch(() => {
          // Silently fail - causes will just be empty
        })
        .finally(() => {
          setLoadingCauses(false);
        });
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold">
            Trust<span className="text-emerald-400">Chain</span>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="rounded-full border border-zinc-700 px-4 py-1.5 hover:border-zinc-400"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-emerald-500 px-4 py-1.5 font-medium text-zinc-950 hover:bg-emerald-400"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-10">
        <section className="grid gap-10 md:grid-cols-[1.5fr,1fr] md:items-center">
          <div className="space-y-6">
            <p className="inline rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-200">
              NGOs • Volunteers • On-chain donations
            </p>
            <h1 className="text-balance text-4xl font-semibold leading-tight md:text-5xl">
              Build <span className="text-emerald-400">trust</span> into every
              donation and volunteering hour.
            </h1>
            <p className="max-w-xl text-balance text-sm text-zinc-300 md:text-base">
              A student-friendly platform that connects volunteers with NGOs and
              records every successful donation on an Ethereum testnet. Verify
              impact, track funds, and coordinate events in one transparent
              dashboard.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link
                href="/register?role=ngo"
                className="rounded-full bg-zinc-50 px-4 py-2 font-medium text-zinc-900 hover:bg-zinc-200"
              >
                I&apos;m an NGO
              </Link>
              <Link
                href="/register?role=volunteer"
                className="rounded-full border border-zinc-700 px-4 py-2 font-medium text-zinc-100 hover:border-zinc-400"
              >
                I&apos;m a volunteer
              </Link>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h2 className="text-sm font-medium text-zinc-200">
              Live causes (demo data)
            </h2>
            <p className="text-xs text-zinc-400">
              Connected to your Node.js + MongoDB backend. Successful donations
              are hashed with keccak256 and can be recorded on-chain.
            </p>
            {loadingCauses ? (
              <p className="text-xs text-zinc-400">Loading causes…</p>
            ) : !causes.length ? (
              <p className="text-xs text-zinc-400">
                No causes yet. NGOs can create their first campaign from the
                dashboard.
              </p>
            ) : (
              <ul className="space-y-3 text-sm">
                {causes.map((cause) => (
                  <li
                    key={cause._id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-zinc-200">
                          {cause.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[11px] text-zinc-400">
                          {cause.description}
                        </p>
                      </div>
                      <div className="text-right text-[11px]">
                        <p className="text-emerald-300">
                          ₹{cause.currentAmount.toLocaleString()}{" "}
                          <span className="text-zinc-500">
                            / ₹{cause.requiredAmount.toLocaleString()}
                          </span>
                        </p>
                        <p className="mt-1 text-zinc-500">
                          {cause.volunteers?.length || 0} volunteers
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

