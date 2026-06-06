import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Loader2, Film } from "lucide-react";
import { toast } from "react-hot-toast";
import AccountShell from "@/components/Layout/AccountShell";
import { Button } from "@/components/ui/button";
import { PageTransition, Stagger, StaggerItem } from "@/components/ui/Motion";
import { MovieCard } from "@/components/nowshowing/nowshowing";
import { api } from "@/lib/api";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/wishlist");
      setItems(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Could not load your wishlist.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // The MovieCard's heart already calls `api.delete("/wishlist/:id")` itself,
  // so this page just needs to drop the row locally when the card un-hearts.
  // Avoids a double-DELETE round trip and an extra refetch.
  const handleUnwishlisted = useCallback((movieId) => {
    if (!movieId) return;
    setItems((prev) => prev.filter((it) => it?.movieId?._id !== movieId));
    toast.success("Removed from wishlist");
  }, []);

  return (
    <PageTransition>
      <AccountShell>
        <div className="pb-4 mb-6 border-b border-slate-200 flex items-start gap-3">
          <div className="grid place-items-center w-10 h-10 rounded-xl bg-red-100 border border-red-200 text-red-700 flex-shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Wishlist</h2>
            <p className="text-sm text-slate-400 mt-1">
              Movies you've saved for later.
            </p>
          </div>
        </div>

        {loading && (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
            <p className="text-rose-700">{error}</p>
            <Button
              className="mt-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg h-10 px-5 transition-all"
              onClick={fetchWishlist}
            >
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="py-14 flex flex-col items-center text-center">
            <motion.div
              className="grid place-items-center w-14 h-14 rounded-2xl bg-red-50 border border-red-200 mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                duration: 2.4,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            >
              <Heart className="h-7 w-7 text-red-600" />
            </motion.div>
            <p className="text-lg font-semibold text-slate-900">
              No movies in your wishlist yet
            </p>
            <p className="text-sm text-slate-400 mt-2 max-w-sm">
              Tap the heart on any movie to save it here for later.
            </p>
            <Button
              asChild
              className="mt-5 h-11 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              <Link to="/movies">
                <Film className="w-4 h-4 mr-2" />
                Browse movies
              </Link>
            </Button>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <Stagger
            asScroll
            gap={0.06}
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            <AnimatePresence>
              {items.map((item, index) => {
                const movie = item?.movieId;
                if (!movie?._id) return null;
                return (
                  <motion.div
                    key={item._id || movie._id}
                    layout
                    exit={{ opacity: 0, scale: 0.85, x: -40 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                  >
                    <StaggerItem>
                      <MovieCard
                        movie={movie}
                        index={index}
                        initialWishlisted
                        onWishlistChange={(next) => {
                          // The card itself already DELETE'd via the heart toggle —
                          // we just drop the row from the local list.
                          if (!next) handleUnwishlisted(movie._id);
                        }}
                      />
                    </StaggerItem>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </Stagger>
        )}
      </AccountShell>
    </PageTransition>
  );
}
