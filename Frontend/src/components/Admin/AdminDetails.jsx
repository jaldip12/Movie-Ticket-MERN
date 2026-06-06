import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  IndianRupee,
  Ticket,
  Users,
  Film,
  Calendar,
  TrendingUp,
  Inbox,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  PageTransition,
  HoverLift,
  Stagger,
  StaggerItem,
} from "@/components/ui/Motion";

const formatINR = (n) => {
  if (typeof n !== "number") return "₹0";
  return `₹${n.toLocaleString("en-IN")}`;
};

const formatDateTime = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "—";
  }
};

const KpiCard = ({ icon: Icon, label, value, delta, deltaTone = "muted" }) => {
  const deltaClass =
    deltaTone === "positive" ? "text-emerald-600" : "text-slate-500";
  return (
    <HoverLift
      whileHover={{
        y: -2,
        transition: { type: "spring", stiffness: 380, damping: 30 },
      }}
      className="h-full"
    >
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition-colors hover:border-slate-300 h-full">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-slate-500">{label}</p>
          <div
            className="bg-red-100 text-red-600 rounded-lg p-2"
            aria-hidden="true"
          >
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">
          {value}
        </p>
        {delta ? (
          <p className={`text-xs ${deltaClass} mt-2 flex items-center gap-1`}>
            {deltaTone === "positive" && (
              <TrendingUp className="w-3 h-3" aria-hidden="true" />
            )}
            {delta}
          </p>
        ) : (
          <p className="text-xs text-slate-600 mt-2">—</p>
        )}
      </div>
    </HoverLift>
  );
};

const KpiSkeleton = () => (
  <div className="bg-white border border-slate-200 rounded-xl p-5">
    <div className="flex items-start justify-between gap-3">
      <Skeleton className="h-4 w-24 bg-slate-100" />
      <Skeleton className="h-8 w-8 bg-slate-100 rounded-lg" />
    </div>
    <Skeleton className="h-8 w-20 bg-slate-100 mt-3" />
    <Skeleton className="h-3 w-16 bg-slate-100 mt-3" />
  </div>
);

const PanelCard = ({ title, action, children }) => (
  <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
      <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
        {title}
      </h3>
      {action}
    </div>
    <div className="px-5 py-4">{children}</div>
  </div>
);

export default function AdminDetails() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [recent, setRecent] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadStats = async () => {
      setStatsLoading(true);
      try {
        const res = await api.get("/admin/stats");
        if (!ignore) setStats(res.data?.data ?? null);
      } catch (err) {
      } finally {
        if (!ignore) setStatsLoading(false);
      }
    };

    const loadRecent = async () => {
      setRecentLoading(true);
      try {
        const res = await api.get("/bookings", { params: { limit: 5 } });
        const data = res.data?.data || {};
        if (!ignore) setRecent(data.items ?? []);
      } catch (err) {
      } finally {
        if (!ignore) setRecentLoading(false);
      }
    };

    loadStats();
    loadRecent();

    return () => {
      ignore = true;
    };
  }, []);

  const containerAnimation = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <PageTransition>
    <motion.div
      className="max-w-7xl mx-auto"
      initial="hidden"
      animate="show"
      variants={containerAnimation}
    >
      <motion.div variants={itemAnimation} className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
          Welcome back, {user?.firstname || "Admin"}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Here&apos;s what&apos;s happening today.
        </p>
      </motion.div>

      <motion.div
        variants={itemAnimation}
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-8"
      >
        {statsLoading || !stats ? (
          Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiCard
              icon={IndianRupee}
              label="Revenue"
              value={formatINR(stats.revenue.total)}
              delta={`+${formatINR(stats.revenue.last7Days)} this week`}
              deltaTone="positive"
            />
            <KpiCard
              icon={Ticket}
              label="Bookings"
              value={stats.bookings.total.toLocaleString("en-IN")}
              delta={`+${stats.bookings.last7Days} this week`}
              deltaTone="positive"
            />
            <KpiCard
              icon={Users}
              label="Active Users"
              value={stats.users.active.toLocaleString("en-IN")}
              delta={`+${stats.users.newLast7Days} this week`}
              deltaTone="positive"
            />
            <KpiCard
              icon={Film}
              label="Movies Showing"
              value={stats.movies.nowShowing.toLocaleString("en-IN")}
              delta={`${stats.movies.featured} featured`}
            />
            <KpiCard
              icon={Calendar}
              label="Shows Upcoming"
              value={stats.shows.upcoming.toLocaleString("en-IN")}
              delta={`${stats.shows.total} total`}
            />
          </>
        )}
      </motion.div>

      <motion.div
        variants={itemAnimation}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <PanelCard title="Top movies (5)">
          {statsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-10 h-14 bg-slate-100 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40 bg-slate-100 mb-2" />
                    <Skeleton className="h-3 w-24 bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : !stats?.topMovies?.length ? (
            <div className="text-slate-500 text-center py-12 flex flex-col items-center gap-2">
              <Inbox className="w-6 h-6" aria-hidden="true" />
              <p className="text-sm">No bookings yet.</p>
            </div>
          ) : (
            <Stagger gap={0.04}>
              {stats.topMovies.map((m, idx) => (
                <StaggerItem
                  key={m.movieId || idx}
                  className="flex items-center gap-3 py-3 border-b border-slate-200 last:border-b-0"
                >
                  <span className="text-slate-500 text-xs font-medium w-5 text-center">
                    {idx + 1}
                  </span>
                  {m.poster ? (
                    <button
                      type="button"
                      className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      aria-label={`View ${m.title || "movie"}`}
                    >
                      <img
                        src={m.poster}
                        alt={m.title}
                        className="w-10 h-14 object-cover rounded-md ring-1 ring-slate-200"
                      />
                    </button>
                  ) : (
                    <div className="w-10 h-14 bg-slate-100 rounded-md ring-1 ring-slate-200" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 font-medium truncate text-sm">
                      {m.title || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {m.bookings} bookings
                    </p>
                  </div>
                  <span className="text-red-500 font-semibold text-sm whitespace-nowrap">
                    {formatINR(m.revenue || 0)}
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </PanelCard>

        <PanelCard title="Recent bookings">
          {recentLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-48 bg-slate-100 mb-2" />
                  <Skeleton className="h-3 w-32 bg-slate-100" />
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="text-slate-500 text-center py-12 flex flex-col items-center gap-2">
              <Inbox className="w-6 h-6" aria-hidden="true" />
              <p className="text-sm">No recent bookings.</p>
            </div>
          ) : (
            <Stagger gap={0.04}>
              {recent.map((b) => (
                <StaggerItem
                  key={b._id}
                  className="py-3 border-b border-slate-200 last:border-b-0 flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 text-sm truncate">
                      <span className="font-medium">
                        {b.userId?.firstname || "Guest"}
                      </span>{" "}
                      <span className="text-slate-500">booked</span>{" "}
                      <span className="text-red-500">
                        {b.showId?.movieId?.title || "a show"}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {(b.seats || []).join(", ")} •{" "}
                      {formatDateTime(b.createdAt)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                    {formatINR(b.totalAmount || 0)}
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </PanelCard>
      </motion.div>
    </motion.div>
    </PageTransition>
  );
}
