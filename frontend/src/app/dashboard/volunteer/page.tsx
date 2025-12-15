"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../components/AuthContext";
import {
  createDonationIntent,
  fetchCauses,
  fetchMyDonations,
  type Cause,
  type Donation,
  volunteerForCause,
  verifyDonation,
} from "../../../lib/api";

export default function VolunteerDashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [causes, setCauses] = useState<Cause[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loadingCauses, setLoadingCauses] = useState(true);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [donateState, setDonateState] = useState<{
    [causeId: string]: { amount: string; loading: boolean; error?: string };
  }>({});
  const [qrForCause, setQrForCause] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    // volunteers, donors, NGOs can view this page; only redirect if admin
    if (user.role === "ngo") {
      router.replace("/dashboard/ngo");
      return;
    }
    loadCauses();
    loadDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  async function loadCauses() {
    setLoadingCauses(true);
    try {
      const data = await fetchCauses();
      setCauses(data.causes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCauses(false);
    }
  }

  async function loadDonations() {
    setLoadingDonations(true);
    try {
      const data = await fetchMyDonations();
      setDonations(data.donations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDonations(false);
    }
  }

  async function handleVolunteer(causeId: string) {
    try {
      await volunteerForCause(causeId);
      loadCauses();
    } catch (err) {
      console.error(err);
      // soft-fail
    }
  }

  async function handleDonate(causeId: string) {
    const state = donateState[causeId] || { amount: "" };
    const amountNum = Number(state.amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setDonateState((prev) => ({
        ...prev,
        [causeId]: { ...state, error: "Enter a valid amount" },
      }));
      return;
    }

    setDonateState((prev) => ({
      ...prev,
      [causeId]: { ...state, loading: true, error: undefined },
    }));

    try {
      // Step 1: create intent (simulates Paytm order)
      const intent = await createDonationIntent({
        causeId,
        amount: amountNum,
      });

      // Step 2: simulate Paytm sandbox success & verify
      await verifyDonation({
        donationId: intent.donationId,
        status: "SUCCESS",
        txDetails: {
          provider: "paytm-sandbox",
          orderId: intent.payment.orderId,
          mock: true,
        },
      });

      setDonateState((prev) => ({
        ...prev,
        [causeId]: { amount: "", loading: false },
      }));
      setQrForCause(null);
      loadDonations();
      loadCauses();
    } catch (err: any) {
      setDonateState((prev) => ({
        ...prev,
        [causeId]: {
          ...state,
          loading: false,
          error: err.message || "Donation failed",
        },
      }));
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold text-emerald-300">
              TrustChain • Volunteer dashboard
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

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-8 md:grid-cols-[1.6fr,1.2fr]">
        <section>
          <h2 className="text-sm font-semibold">Discover causes</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Register as a volunteer, or donate directly. Successful donations
            are hashed and can be recorded on-chain.
          </p>

          <div className="mt-4 space-y-3">
            {loadingCauses ? (
              <p className="text-xs text-zinc-400">Loading causes…</p>
            ) : !causes.length ? (
              <p className="text-xs text-zinc-400">
                No causes yet. Check back later or contact an NGO to publish
                their first campaign.
              </p>
            ) : (
              causes.map((cause) => {
                const state = donateState[cause._id] || {
                  amount: "",
                  loading: false,
                };
                const volunteersCount = cause.volunteers?.length || 0;
                return (
                  <div
                    key={cause._id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-xs"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-zinc-100">
                          {cause.title}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          {cause.description}
                        </p>
                        {cause.location && (
                          <p className="text-[11px] text-zinc-500">
                            📍 {cause.location}
                          </p>
                        )}
                        <p className="text-[11px] text-zinc-500">
                          Posted by {cause.createdBy.name}
                        </p>
                      </div>
                      <div className="min-w-[180px] space-y-2 text-right">
                        <p className="text-[11px] text-emerald-300">
                          ₹{cause.currentAmount.toLocaleString()}{" "}
                          <span className="text-zinc-500">
                            / ₹{cause.requiredAmount.toLocaleString()}
                          </span>
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {volunteersCount} volunteers enrolled
                        </p>
                        <div className="flex justify-end gap-2 text-[11px]">
                          <button
                            onClick={() => handleVolunteer(cause._id)}
                            className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-100 hover:border-zinc-400"
                          >
                            Volunteer
                          </button>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            min={1}
                            placeholder="Amount (₹)"
                            className="w-28 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-right text-[11px] outline-none focus:border-emerald-400"
                            value={state.amount}
                            onChange={(e) =>
                              setDonateState((prev) => ({
                                ...prev,
                                [cause._id]: {
                                  ...state,
                                  amount: e.target.value,
                                  error: undefined,
                                },
                              }))
                            }
                          />
                          <button
                            onClick={() => setQrForCause(cause._id)}
                            disabled={state.loading}
                            className="rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-medium text-zinc-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {state.loading ? "Processing…" : "Pay via UPI"}
                          </button>
                        </div>
                        {state.error && (
                          <p className="mt-1 text-right text-[11px] text-red-400">
                            {state.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold">Your donations</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Track your contribution history. Successful donations include a
            keccak256 hash and optional on-chain transaction hash.
          </p>

          <div className="mt-4 space-y-3">
            {loadingDonations ? (
              <p className="text-xs text-zinc-400">Loading donations…</p>
            ) : !donations.length ? (
              <p className="text-xs text-zinc-400">
                You haven&apos;t donated yet. Support a cause from the list on
                the left.
              </p>
            ) : (
              donations.map((d) => (
                <div
                  key={d._id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-[11px]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-zinc-100">
                        {d.causeId.title}
                      </p>
                      <p className="mt-1 text-[11px] text-zinc-400">
                        Amount: ₹{d.amount.toLocaleString()}
                      </p>
                      <p className="mt-1 text-[11px] text-zinc-500">
                        {new Date(d.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="max-w-[220px] text-right">
                      {d.hash ? (
                        <>
                          <p className="text-[11px] text-emerald-300">
                            Hash: {d.hash.slice(0, 10)}…
                          </p>
                          {d.onChainTx && (
                            <p className="mt-1 text-[11px] text-emerald-200">
                              Tx: {d.onChainTx.slice(0, 10)}…
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-[11px] text-zinc-500">
                          Pending verification / on-chain record.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
      {/* UPI QR modal (uses a shared scanner/QR for now) */}
      {qrForCause && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-xs shadow-xl">
            <h3 className="text-sm font-semibold text-zinc-100">
              Pay securely via UPI
            </h3>
            <p className="mt-1 text-[11px] text-zinc-400">
              1. Open your UPI app (GPay/PhonePe/Paytm etc.) and scan this QR.
              2. Complete the payment for the amount you entered. 3. Tap
              &quot;I have paid&quot; to record this donation with a keccak256
              hash and optional on-chain entry.
            </p>
            <div className="mt-3 flex justify-center">
              <Image
                src="/upi-qr.png.jpeg"
                alt="UPI payment QR"
                width={260}
                height={260}
                className="rounded-lg border border-zinc-800 bg-white p-2"
              />
            </div>
            <div className="mt-4 flex items-center justify-end gap-2 text-[11px]">
              <button
                onClick={() => setQrForCause(null)}
                className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-200 hover:border-zinc-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDonate(qrForCause)}
                className="rounded-full bg-emerald-500 px-3 py-1 font-medium text-zinc-950 hover:bg-emerald-400"
              >
                I have paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



