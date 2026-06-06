import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";
import Movie from "../models/movie.model.js";
import Show from "../models/show.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponce.js";

// CSV escape: wrap fields with ,/"/\n in quotes; escape internal quotes
const csvEscape = (val) => {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

const csvRow = (fields) => fields.map(csvEscape).join(",") + "\n";

const formatDateForFilename = (d = new Date()) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const getStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const today = startOfDay(now);

  // Revenue (confirmed bookings only)
  const [revenueAgg, revenue7Agg, revenue30Agg] = await Promise.all([
    Booking.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Booking.aggregate([
      { $match: { status: "confirmed", createdAt: { $gte: last7 } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Booking.aggregate([
      { $match: { status: "confirmed", createdAt: { $gte: last30 } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
  ]);

  // Bookings counts
  const [
    bookingsTotal,
    bookingsConfirmed,
    bookingsCancelled,
    bookingsLast7,
  ] = await Promise.all([
    Booking.countDocuments({}),
    Booking.countDocuments({ status: "confirmed" }),
    Booking.countDocuments({ status: "cancelled" }),
    Booking.countDocuments({ createdAt: { $gte: last7 } }),
  ]);

  // Users counts
  const [usersTotal, usersActive, usersNewLast7] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ createdAt: { $gte: last7 } }),
  ]);

  // Movies counts
  const [moviesTotal, moviesNowShowing, moviesFeatured] = await Promise.all([
    Movie.countDocuments({ isActive: true }),
    Movie.countDocuments({ isActive: true, isNowShowing: true }),
    Movie.countDocuments({ isActive: true, isFeatured: true }),
  ]);

  // Shows counts
  const [showsTotal, showsUpcoming] = await Promise.all([
    Show.countDocuments({ isActive: true }),
    Show.countDocuments({ isActive: true, date: { $gte: today } }),
  ]);

  // Top movies — top 5 by booking count among confirmed bookings
  const topMoviesAgg = await Booking.aggregate([
    { $match: { status: "confirmed" } },
    {
      $lookup: {
        from: "shows",
        localField: "showId",
        foreignField: "_id",
        as: "show",
      },
    },
    { $unwind: "$show" },
    {
      $group: {
        _id: "$show.movieId",
        bookings: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { bookings: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "movies",
        localField: "_id",
        foreignField: "_id",
        as: "movie",
      },
    },
    { $unwind: { path: "$movie", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        movieId: "$_id",
        title: "$movie.title",
        poster: "$movie.poster",
        bookings: 1,
        revenue: 1,
      },
    },
  ]);

  const stats = {
    revenue: {
      total: revenueAgg[0]?.total ?? 0,
      last7Days: revenue7Agg[0]?.total ?? 0,
      last30Days: revenue30Agg[0]?.total ?? 0,
    },
    bookings: {
      total: bookingsTotal,
      confirmed: bookingsConfirmed,
      cancelled: bookingsCancelled,
      last7Days: bookingsLast7,
    },
    users: {
      total: usersTotal,
      active: usersActive,
      newLast7Days: usersNewLast7,
    },
    movies: {
      total: moviesTotal,
      nowShowing: moviesNowShowing,
      featured: moviesFeatured,
    },
    shows: {
      total: showsTotal,
      upcoming: showsUpcoming,
    },
    topMovies: topMoviesAgg,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Admin stats fetched successfully"));
});

const exportBookingsCSV = asyncHandler(async (req, res) => {
  const { status, from, to } = req.query;

  const filter = {};
  if (status && typeof status === "string" && status.trim()) {
    filter.status = status.trim();
  }
  const createdAt = {};
  if (from) {
    const f = new Date(from);
    if (!isNaN(f.getTime())) createdAt.$gte = f;
  }
  if (to) {
    const t = new Date(to);
    if (!isNaN(t.getTime())) createdAt.$lte = t;
  }
  if (Object.keys(createdAt).length > 0) filter.createdAt = createdAt;

  const bookings = await Booking.find(filter)
    .sort({ createdAt: -1 })
    .populate({ path: "userId", select: "firstname lastname email number" })
    .populate({
      path: "showId",
      select: "date time movieId screenId",
      populate: [
        { path: "movieId", select: "title" },
        {
          path: "screenId",
          select: "name cinemaId",
          populate: { path: "cinemaId", select: "name city" },
        },
      ],
    })
    .lean();

  const filename = `bookings-${formatDateForFilename()}.csv`;
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );

  const header = [
    "bookingId",
    "createdAt",
    "userEmail",
    "userName",
    "userPhone",
    "movieTitle",
    "cinema",
    "screen",
    "showDate",
    "showTime",
    "seats",
    "fnbCount",
    "totalAmount",
    "status",
  ];
  res.write(csvRow(header));

  for (const b of bookings) {
    const user = b.userId || {};
    const show = b.showId || {};
    const movie = show.movieId || {};
    const screen = show.screenId || {};
    const cinema = screen.cinemaId || {};
    const userName = `${user.firstname || ""} ${user.lastname || ""}`.trim();
    const cinemaName = cinema.name
      ? cinema.city
        ? `${cinema.name} (${cinema.city})`
        : cinema.name
      : "";
    const showDate = show.date
      ? new Date(show.date).toISOString().slice(0, 10)
      : "";
    const fnbCount = Array.isArray(b.fnbItems)
      ? b.fnbItems.reduce((sum, it) => sum + (it?.quantity || 0), 0)
      : 0;
    res.write(
      csvRow([
        b._id,
        b.createdAt ? new Date(b.createdAt).toISOString() : "",
        user.email || "",
        userName,
        user.number || "",
        movie.title || "",
        cinemaName,
        screen.name || "",
        showDate,
        show.time || "",
        Array.isArray(b.seats) ? b.seats.join(" ") : "",
        fnbCount,
        b.totalAmount ?? "",
        b.status || "",
      ])
    );
  }

  res.end();
});

const exportUsersCSV = asyncHandler(async (req, res) => {
  const { role, isActive } = req.query;
  const filter = {};
  if (role && typeof role === "string" && role.trim()) {
    filter.role = role.trim();
  }
  if (isActive === "true") filter.isActive = true;
  else if (isActive === "false") filter.isActive = false;

  const users = await User.find(filter).sort({ createdAt: -1 }).lean();

  const filename = `users-${formatDateForFilename()}.csv`;
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );

  const header = [
    "userId",
    "createdAt",
    "firstname",
    "lastname",
    "email",
    "phone",
    "gender",
    "city",
    "role",
    "isActive",
  ];
  res.write(csvRow(header));

  for (const u of users) {
    res.write(
      csvRow([
        u._id,
        u.createdAt ? new Date(u.createdAt).toISOString() : "",
        u.firstname || "",
        u.lastname || "",
        u.email || "",
        u.number || "",
        u.gender || "",
        u.city || "",
        u.role || "",
        u.isActive ? "true" : "false",
      ])
    );
  }

  res.end();
});

export { getStats, exportBookingsCSV, exportUsersCSV };
