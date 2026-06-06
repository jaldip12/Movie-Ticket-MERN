import mongoose, { Schema } from "mongoose";

const WishlistSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movieId: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
  },
  { timestamps: true }
);

// One row per (user, movie). Prevents duplicates at the DB level so we don't
// have to handle race conditions in the controller.
WishlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });

// The list view always reads "my wishlist, newest first" — back this with an
// index so we don't sort the whole collection on every request.
WishlistSchema.index({ userId: 1, createdAt: -1 });

const Wishlist = mongoose.model("Wishlist", WishlistSchema);

export default Wishlist;
