import { useEffect, useMemo, useState } from "react";
import { Star, ShieldCheck, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const PAGE_SIZE = 5;
const MAX_TEXT = 1000;

const formatDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

/**
 * Pure-display 5-star row. `value` is a 1-5 average; supports halves visually
 * by filling whole stars only (rounded). Set `interactive` to allow click /
 * hover to set a rating via `onChange`.
 */
function Stars({
  value = 0,
  size = 16,
  interactive = false,
  onChange,
  hoverValue,
  onHover,
  onLeave,
}) {
  const filled = interactive ? hoverValue || value : Math.round(value || 0);
  return (
    <div
      className="inline-flex items-center gap-0.5"
      onMouseLeave={interactive ? onLeave : undefined}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const isFilled = i <= filled;
        const cls = isFilled
          ? "text-amber-600 fill-amber-400"
          : "text-slate-600";
        if (interactive) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange?.(i)}
              onMouseEnter={() => onHover?.(i)}
              className="p-0.5 transition-colors"
              aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
            >
              <Star className={cls} style={{ width: size, height: size }} />
            </button>
          );
        }
        return (
          <Star
            key={i}
            className={cls}
            style={{ width: size, height: size }}
          />
        );
      })}
    </div>
  );
}

function ReviewCard({ review, isOwn, onEdit, onDelete, deleting }) {
  const name = review.userId?.firstname || "Viewer";
  return (
    <div className="rounded-xl border border-white/5 bg-white/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900">{name}</span>
            {review.isVerifiedBooking !== false && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3" />
                Verified booking
              </span>
            )}
            {isOwn && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-700 border border-red-200">
                Your review
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Stars value={review.rating} size={14} />
            <span className="text-xs text-slate-400">
              {formatDate(review.createdAt)}
            </span>
          </div>
        </div>
        {isOwn && (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-slate-700 hover:text-red-600 hover:bg-slate-50 transition-colors"
              onClick={onEdit}
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-slate-700 hover:text-rose-600 hover:bg-slate-50 transition-colors"
              onClick={onDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1" />
              )}
              Delete
            </Button>
          </div>
        )}
      </div>
      {review.text && (
        <p className="mt-3 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
          {review.text}
        </p>
      )}
    </div>
  );
}

export default function ReviewSection({ movieId }) {
  const { status, user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [average, setAverage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchReviews = async (nextPage = 1, append = false) => {
    if (!movieId) return;
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const res = await api.get(`/reviews/movie/${movieId}`, {
        params: { page: nextPage, limit: PAGE_SIZE },
      });
      const data = res.data?.data || {};
      setTotal(data.total ?? 0);
      setAverage(data.average ?? 0);
      setPage(data.page ?? nextPage);
      setPageCount(data.pageCount ?? 0);
      setItems((prev) => {
        const incoming = data.items ?? [];
        if (!append) return incoming;
        const seen = new Set(prev.map((r) => r._id));
        return [...prev, ...incoming.filter((r) => !seen.has(r._id))];
      });
    } catch (err) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchReviews(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  const myReview = useMemo(() => {
    if (!user?._id) return null;
    return items.find((r) => r.userId?._id && r.userId._id === user._id);
  }, [items, user?._id]);

  const isAuthed = status === "authenticated";

  // When the user clicks Edit on their own review, prefill the form.
  const startEdit = () => {
    if (!myReview) return;
    setEditingId(myReview._id);
    setRating(myReview.rating);
    setText(myReview.text || "");
    setFormError("");
    // scroll the form into view (best-effort)
    setTimeout(() => {
      document
        .getElementById("review-form")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setRating(0);
    setHoverRating(0);
    setText("");
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!isAuthed) {
      setFormError("Please log in to write a review.");
      return;
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setFormError("Please pick a rating from 1 to 5 stars.");
      return;
    }
    if (text.length > MAX_TEXT) {
      setFormError(`Review must be ${MAX_TEXT} characters or fewer.`);
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await api.patch(`/reviews/me/${editingId}`, {
          rating,
          text,
        });
        const updated = res.data?.data;
        if (updated) {
          setItems((prev) =>
            prev.map((r) => (r._id === editingId ? updated : r))
          );
        }
        toast.success("Review updated");
        await fetchReviews(1, false);
      } else {
        const res = await api.post("/reviews", { movieId, rating, text });
        const created = res.data?.data;
        if (created) {
          setItems((prev) => [
            created,
            ...prev.filter((r) => r._id !== created._id),
          ]);
          setTotal((t) => t + 1);
        }
        toast.success("Thanks for your review!");
        await fetchReviews(1, false);
      }
      cancelEdit();
    } catch (err) {
      const status = err.response?.status;
      const message =
        err.response?.data?.message ||
        (status === 403
          ? "Only viewers who completed a booking can review"
          : "Failed to submit review");
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete your review? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/reviews/me/${id}`);
      toast.success("Review deleted");
      if (editingId === id) cancelEdit();
      await fetchReviews(1, false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete review");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoadMore = () => {
    if (loadingMore || page >= pageCount) return;
    fetchReviews(page + 1, true);
  };

  // Hide the user's own review from the main list (it's shown separately above).
  const otherReviews = useMemo(
    () => items.filter((r) => !myReview || r._id !== myReview._id),
    [items, myReview]
  );

  const showForm = isAuthed && (!myReview || editingId === myReview?._id);

  return (
    <section className="container mx-auto px-4 mt-12 md:mt-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            Reviews
          </h2>
          <div className="flex items-center gap-3">
            <Stars value={average} size={20} />
            <div className="text-sm text-slate-700">
              <span className="font-bold text-slate-900 text-base">
                {average ? average.toFixed(1) : "—"}
              </span>
              <span className="text-slate-400">/5</span>
              <span className="mx-2 text-slate-600">·</span>
              <span className="text-slate-400">
                {total} review{total === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>

        {/* Existing user review banner (when not editing) */}
        {isAuthed && myReview && editingId !== myReview._id && (
          <div className="mb-6">
            <ReviewCard
              review={myReview}
              isOwn
              onEdit={startEdit}
              onDelete={() => handleDelete(myReview._id)}
              deleting={deletingId === myReview._id}
            />
          </div>
        )}

        {/* Write / edit form */}
        {showForm && (
          <form
            id="review-form"
            onSubmit={handleSubmit}
            className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl p-5 md:p-6"
          >
            <h3 className="text-lg font-semibold tracking-tight text-slate-900 mb-4">
              {editingId ? "Edit your review" : "Write a review"}
            </h3>

            <div className="flex items-center gap-3 mb-4">
              <Stars
                value={rating}
                hoverValue={hoverRating}
                size={32}
                interactive
                onChange={setRating}
                onHover={setHoverRating}
                onLeave={() => setHoverRating(0)}
              />
              {rating > 0 && (
                <span className="text-sm text-slate-700 font-medium">
                  {rating} / 5
                </span>
              )}
            </div>

            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
              placeholder="Share your experience (optional)"
              rows={4}
              className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:border-red-500 focus-visible:ring-red-500/20 rounded-xl"
            />
            <div className="mt-1 text-xs text-slate-500 text-right">
              {text.length} / {MAX_TEXT}
            </div>

            {formError && (
              <div className="mt-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {formError}
              </div>
            )}

            <div className="mt-5 flex items-center gap-2">
              <Button
                type="submit"
                disabled={submitting}
                className="h-11 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Saving…
                  </>
                ) : editingId ? (
                  "Save changes"
                ) : (
                  "Submit review"
                )}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  className="h-11 px-5 bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 rounded-xl transition-colors"
                  onClick={cancelEdit}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        )}

        {!isAuthed && (
          <div className="mb-8 rounded-xl border border-white/5 bg-white/60 p-4 text-sm text-slate-700">
            <span className="text-slate-400">
              Log in after watching the movie to leave a review.
            </span>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-10 text-slate-400">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Loading reviews…
          </div>
        ) : total === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-400">
            No reviews yet — be the first!
          </div>
        ) : (
          <div className="space-y-4">
            {otherReviews.map((r) => (
              <ReviewCard key={r._id} review={r} />
            ))}

            {items.length < total && (
              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  className="h-11 px-5 bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 rounded-xl transition-colors"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      Loading…
                    </>
                  ) : (
                    "Load more"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
