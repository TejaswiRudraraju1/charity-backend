import { fetchCauses } from "../../lib/api";

export default async function CausesList() {
  try {
    const data = await fetchCauses();
    if (!data.causes.length) {
      return (
        <p className="text-xs text-zinc-400">
          No causes yet. NGOs can create their first campaign from the
          dashboard.
        </p>
      );
    }

    return (
      <ul className="space-y-3 text-sm">
        {data.causes.slice(0, 4).map((cause) => (
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
    );
  } catch {
    return (
      <p className="text-xs text-red-400">
        Could not load causes. Make sure the backend is running on port 5000.
      </p>
    );
  }
}


