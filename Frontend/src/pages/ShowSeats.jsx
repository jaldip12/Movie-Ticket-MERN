import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PublicShell from "@/components/Layout/PublicShell";
import ShowSeatingLayout from "@/components/nowshowing/ShowSeatingLayout";
import { SeatingLayoutSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";

export default function ShowSeats() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get(`/shows/${showId}`);
        if (!alive) return;
        setShow(res.data?.data || null);
      } catch (err) {
        if (!alive) return;
        setError(err?.response?.data?.message || "Could not load this show");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [showId]);

  return (
    <PublicShell>
      <div className="container mx-auto px-4 py-6 md:py-10">
        {loading ? (
          <SeatingLayoutSkeleton />
        ) : error || !show ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            <p>{error || "Show not found."}</p>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-4 px-4 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800"
            >
              Go back
            </button>
          </div>
        ) : (
          <ShowSeatingLayout
            seatingLayoutName={show.screenId?.seatingPlanId?.name}
            seatingLayoutLabel={show.screenId?.seatingPlanId?.name}
            showId={show._id}
            showTime={show.time}
            showDate={show.date}
            movieTitle={show.movieId?.title}
            theater={show.screenId?.cinemaId?.name}
            cinemaId={show.screenId?.cinemaId?._id}
            bookedSeats={show.bookedSeats || []}
            lockedSeats={(show.lockedSeats || []).map((l) => l.seat || l)}
          />
        )}
      </div>
    </PublicShell>
  );
}
