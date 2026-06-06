/* eslint-disable no-console */
import "dotenv/config";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import User from "../src/models/user.model.js";
import Cinema from "../src/models/cinema.model.js";
import Screen from "../src/models/screen.model.js";
import Seating from "../src/models/Seating.model.js";
import Movie from "../src/models/movie.model.js";
import Show from "../src/models/show.model.js";
import FnbItem from "../src/models/fnbItem.model.js";
import Coupon from "../src/models/coupon.model.js";
import Banner from "../src/models/banner.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

const DB_NAME = "ticket-booking";
const FORCE = process.argv.includes("--force");

const ADMIN_EMAIL = "admin@cinepolis.com";
const ADMIN_PASSWORD = "Admin@123";
const TEST_USER_EMAIL = "user@test.com";
const TEST_USER_PASSWORD = "Test@123";

// ---------- R2 helpers ----------

const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");
const R2_BUCKET = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT =
  process.env.R2_ENDPOINT ||
  (process.env.R2_ACCOUNT_ID
    ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : null);

const r2Configured = () =>
  !!(
    R2_BUCKET &&
    R2_ENDPOINT &&
    R2_PUBLIC_URL &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY
  );

const r2Client = r2Configured()
  ? new S3Client({
      region: "auto",
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    })
  : null;

async function isPubliclyReadable(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

async function uploadPoster(localFilename, key, fallbackUrl) {
  const localPath = path.join(PROJECT_ROOT, localFilename);
  if (!fs.existsSync(localPath)) {
    console.warn(`  ⚠ ${localFilename} missing — using fallback`);
    return fallbackUrl;
  }
  if (!r2Client) {
    console.warn(`  ⚠ R2 not configured — using fallback for ${localFilename}`);
    return fallbackUrl;
  }
  const body = fs.readFileSync(localPath);
  const contentType = localFilename.toLowerCase().endsWith(".png")
    ? "image/png"
    : "image/jpeg";
  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
    const url = `${R2_PUBLIC_URL}/${key}`;
    // Verify the public URL is actually serving — R2 buckets default to
    // private until you toggle "Allow public access" in the Cloudflare R2
    // dashboard. If our URL isn't publicly readable yet, fall back to a
    // themed placeholder so users see a working image either way.
    if (await isPubliclyReadable(url)) {
      console.log(`  ✓ uploaded + public ${localFilename} → ${url}`);
      return url;
    }
    console.warn(
      `  ⚠ Uploaded ${localFilename} but ${url} is not publicly readable.\n` +
        `    Enable Public Access on bucket "${R2_BUCKET}" in Cloudflare R2 dashboard\n` +
        `    (Bucket → Settings → Public access → Allow access via r2.dev) and re-run.\n` +
        `    Falling back to placeholder for now.`
    );
    return fallbackUrl;
  } catch (err) {
    console.warn(
      `  ⚠ Upload failed for ${localFilename} (${err?.name || err?.Code || "unknown"}). Using fallback.`
    );
    return fallbackUrl;
  }
}

// ---------- Reliable placeholder posters ----------
// Uses dummyimage.com — returns a real PNG (not SVG), 2:3 poster aspect,
// themed in our dark navy + accent palette. Dummyimage is on the open web
// since 2010 and is rarely on ad-blocker filter lists, unlike placehold.co
// (which served SVGs that some browsers/ad-blockers refused to render).

const placeholderPoster = (title, year, bgHex = "0b0f19", textHex = "dc2626") => {
  const text = encodeURIComponent(`${title} ${year}`);
  return `https://dummyimage.com/400x600/${bgHex}/${textHex}.png&text=${text}`;
};

// ---------- Seating layouts ----------
//
// Convention used by the renderer:
//  - Sections render top→bottom in array order.
//  - The SCREEN sits below the last section, so section[0] is the BACK of the
//    auditorium (premium/recliner) and section[N-1] is closest to the screen
//    (cheapest seats). Within each section, row "A" is its highest row (back
//    of section), the last row is closest to the screen.
//  - Wheelchair + companion pairs go in row A column 1-2 of the back section,
//    where step-free aisle access is easiest in real cinemas.
//  - Aisles are listed as "gap AFTER column N", LTR-skipping for numbering.

// Helper: flat seatType list where every seat in a w×h section is one type.
const fullSeatType = (rows, cols, type) =>
  Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      row: String.fromCharCode(65 + r),
      seat: c + 1,
      type,
    }))
  ).flat();

const seatingLayoutsData = [
  // ─────────────────────────────────────────────────────────────────────
  // 1. Standard Multiplex — bog-standard 3-tier hall, ~176 seats.
  //    Premium recliner row at the back, Gold middle, Silver front-near-screen.
  //    Wheelchair pair in the Premium back row (A1+A2, accessible from aisle).
  // ─────────────────────────────────────────────────────────────────────
  {
    name: "Standard Multiplex",
    sections: [
      {
        name: "Premium",
        rows: 4,
        columns: 12,
        price: 350,
        aisles: [3, 9],
        seatTypes: [
          { row: "A", seat: 1, type: "wheelchair" },
          { row: "A", seat: 2, type: "companion" },
        ],
      },
      {
        name: "Gold",
        rows: 5,
        columns: 16,
        price: 250,
        aisles: [4, 12],
      },
      {
        name: "Silver",
        rows: 3,
        columns: 16,
        price: 150,
        aisles: [4, 12],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 2. Premium Gold Class — boutique 92-seat hall.
  //    All-recliner back block with two loveseat pairs, full-Premium front.
  //    Wheelchair pair on row E1+E2 of Premium (aisle access).
  // ─────────────────────────────────────────────────────────────────────
  {
    name: "Premium Gold Class",
    sections: [
      {
        name: "Recliner",
        rows: 4,
        columns: 8,
        price: 500,
        aisles: [4],
        // Whole block recliner, with a couples-row of loveseats in row B.
        seatTypes: [
          ...fullSeatType(4, 8, "recliner"),
          { row: "B", seat: 4, type: "loveseat" },
          { row: "B", seat: 5, type: "loveseat" },
        ],
      },
      {
        name: "Premium",
        rows: 5,
        columns: 12,
        price: 350,
        aisles: [3, 9],
        seatTypes: [
          { row: "E", seat: 1, type: "wheelchair" },
          { row: "E", seat: 2, type: "companion" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 3. IMAX Auditorium — BookMyShow-style 3-block, ~217 seats.
  //    EXECUTIVE back has a shorter last row (rowOverrides) modelling a real
  //    asymmetric hall + wheelchair pair on A1+A2 (back-left corner, aisle
  //    access). ROYAL middle, MARVEL closest to screen.
  // ─────────────────────────────────────────────────────────────────────
  {
    name: "IMAX Auditorium",
    sections: [
      {
        name: "EXECUTIVE",
        rows: 8,
        columns: 22,
        price: 170,
        aisles: [4, 13],
        seatTypes: [
          { row: "A", seat: 1, type: "wheelchair" },
          { row: "A", seat: 2, type: "companion" },
        ],
        // Row H is the architectural cut-out — only seats 14-16 are physical
        // seats. Cells 1-13 + 17-22 are absent (not "broken"); we use the
        // hidden style so they render as empty space, matching the right-
        // aligned look in real BookMyShow halls.
        unavailableSeats: [
          {
            row: "H",
            seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 17, 18, 19, 20, 21, 22],
          },
        ],
        unavailableStyle: "hidden",
      },
      {
        name: "ROYAL",
        rows: 4,
        columns: 13,
        price: 160,
        aisles: [4],
      },
      {
        name: "MARVEL",
        rows: 2,
        columns: 13,
        price: 140,
        aisles: [4],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 4. Recliner Lounge — intimate 40-seat all-recliner hall.
  //    One couples-row of loveseats (C3+C4), wheelchair pair on row A.
  // ─────────────────────────────────────────────────────────────────────
  {
    name: "Recliner Lounge",
    sections: [
      {
        name: "Recliner",
        rows: 5,
        columns: 8,
        price: 600,
        aisles: [4],
        seatTypes: [
          ...fullSeatType(5, 8, "recliner"),
          { row: "A", seat: 1, type: "wheelchair" },
          { row: "A", seat: 2, type: "companion" },
          { row: "C", seat: 4, type: "loveseat" },
          { row: "C", seat: 5, type: "loveseat" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 5. 7-Star VIP — 18-seat ultra-premium hall.
  //    Centre two columns are loveseats (couple pairs); flanking columns are
  //    recliners. Single centre aisle.
  // ─────────────────────────────────────────────────────────────────────
  {
    name: "7-Star VIP",
    sections: [
      {
        name: "VIP",
        rows: 3,
        columns: 6,
        price: 1200,
        aisles: [3],
        seatTypes: Array.from({ length: 3 }, (_, r) =>
          Array.from({ length: 6 }, (_, c) => ({
            row: String.fromCharCode(65 + r),
            seat: c + 1,
            // cols 3 and 4 are the centre pair (loveseats), rest are recliners
            type: c === 2 || c === 3 ? "loveseat" : "recliner",
          }))
        ).flat(),
      },
    ],
  },
];

// ---------- Cinemas (Ahmedabad) ----------

const cinemasData = [
  {
    name: "Cinépolis Alpha One",
    chain: "Cinépolis",
    themeColor: "#E10000",
    city: "Ahmedabad",
    address: "Alpha One Mall, Vastrapur, Ahmedabad, Gujarat 380015",
  },
  {
    name: "PVR INOX Acropolis",
    chain: "PVR INOX",
    themeColor: "#FFC72C",
    city: "Ahmedabad",
    address: "Acropolis Mall, Thaltej, Ahmedabad, Gujarat 380054",
  },
  {
    name: "Carnival Cinemas Himalaya",
    chain: "Carnival",
    themeColor: "#1B5E20",
    city: "Ahmedabad",
    address: "Himalaya Mall, Drive-In Road, Ahmedabad, Gujarat 380052",
  },
];

// ---------- Movies ----------

const buildMoviesData = (posterUrls) => [
  {
    title: "Kalki 2898 AD",
    poster: posterUrls.kalki,
    rating: 8.0,
    votes: 18420,
    certification: "UA",
    language: "Telugu",
    languages: ["Telugu", "Hindi", "Tamil"],
    genres: ["Sci-Fi", "Action"],
    releaseDate: new Date("2024-06-27"),
    duration: 181,
    description:
      "Set in a dystopian future inspired by Hindu mythology — a modern-day adaptation where Kali, the dark age, has reached its peak.",
    trailerUrl: "https://www.youtube.com/watch?v=tM6KoLY9Z_M",
    isActive: true,
    isNowShowing: true,
    isFeatured: true,
  },
  {
    title: "Martyr",
    poster: posterUrls.martye,
    rating: 7.6,
    votes: 5210,
    certification: "UA",
    language: "Hindi",
    languages: ["Hindi"],
    genres: ["Action", "Drama"],
    releaseDate: new Date("2025-01-10"),
    duration: 138,
    description:
      "A gripping account of a soldier who lays down his life on a covert mission, and the family that fights for his memory.",
    trailerUrl: "",
    isActive: true,
    isNowShowing: true,
    isFeatured: false,
  },
  {
    title: "Ramayana",
    poster: posterUrls.ramayana,
    rating: 8.7,
    votes: 9210,
    certification: "U",
    language: "Hindi",
    languages: ["Hindi", "Tamil", "Telugu", "English"],
    genres: ["Mythology", "Action", "Drama"],
    releaseDate: new Date("2025-04-18"),
    duration: 168,
    description:
      "The timeless epic, retold with breathtaking visual scale — Lord Rama's journey to rescue Sita from Ravana.",
    trailerUrl: "",
    isActive: true,
    isNowShowing: true,
    isFeatured: true,
  },
  {
    title: "Inception",
    poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    rating: 8.4,
    votes: 39580,
    certification: "UA",
    language: "English",
    languages: ["English", "Hindi"],
    genres: ["Sci-Fi", "Thriller"],
    releaseDate: new Date("2010-07-16"),
    duration: 148,
    description:
      "A skilled thief who steals corporate secrets through dream-sharing technology is given the inverse task: planting an idea.",
    trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    isActive: true,
    isNowShowing: true,
    isFeatured: false,
  },
  {
    title: "Dune: Part Two",
    poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    rating: 8.5,
    votes: 22130,
    certification: "UA",
    language: "English",
    languages: ["English", "Hindi"],
    genres: ["Sci-Fi", "Adventure"],
    releaseDate: new Date("2024-03-01"),
    duration: 166,
    description:
      "Paul Atreides unites with the Fremen to wage war against House Harkonnen and avenge his family.",
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    isActive: true,
    isNowShowing: true,
    isFeatured: false,
  },
  {
    title: "Oppenheimer",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    rating: 8.3,
    votes: 31420,
    certification: "A",
    language: "English",
    languages: ["English"],
    genres: ["Drama", "History", "Thriller"],
    releaseDate: new Date("2023-07-21"),
    duration: 180,
    description:
      "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg",
    isActive: true,
    isNowShowing: true,
    isFeatured: false,
  },
  {
    title: "3 Idiots",
    poster: "https://image.tmdb.org/t/p/w500/66A9MqXOyVFCssoloscw79z8Tew.jpg",
    rating: 8.4,
    votes: 41280,
    certification: "U",
    language: "Hindi",
    languages: ["Hindi"],
    genres: ["Comedy", "Drama"],
    releaseDate: new Date("2009-12-25"),
    duration: 170,
    description:
      "Two friends search for their long-lost college mate while reminiscing about the rebellious genius who changed their lives.",
    trailerUrl: "https://www.youtube.com/watch?v=K0eDlFX9GMc",
    isActive: true,
    isNowShowing: true,
    isFeatured: false,
  },
  {
    title: "Pathaan",
    poster: "https://image.tmdb.org/t/p/w500/arf00BkwvXo0CFKbaD9OpqdE4Nu.jpg",
    rating: 7.0,
    votes: 14820,
    certification: "UA",
    language: "Hindi",
    languages: ["Hindi"],
    genres: ["Action", "Thriller"],
    releaseDate: new Date("2023-01-25"),
    duration: 146,
    description:
      "An exiled RAW agent races to stop a deadly plot orchestrated by a former colleague turned terrorist.",
    trailerUrl: "https://www.youtube.com/watch?v=vqu4z34wENw",
    isActive: true,
    isNowShowing: true,
    isFeatured: false,
  },
  {
    title: "Pushpa 2: The Rule",
    poster: "https://image.tmdb.org/t/p/w500/xkYGdKuK8jfqvGNCZV1uNdYkIfS.jpg",
    rating: 7.8,
    votes: 12300,
    certification: "UA",
    language: "Telugu",
    languages: ["Telugu", "Hindi", "Tamil"],
    genres: ["Action", "Thriller"],
    releaseDate: new Date("2024-12-05"),
    duration: 200,
    description:
      "Pushpa Raj returns to his red-sandalwood empire — bigger stakes, fiercer rivals, the kingdom on the line.",
    trailerUrl: "",
    isActive: true,
    isNowShowing: true,
    isFeatured: true,
  },
  {
    title: "Devara: Part 1",
    poster: "https://image.tmdb.org/t/p/w500/lQfuaXjANoTsdx5iS0gCXlK9D2L.jpg",
    rating: 7.4,
    votes: 8800,
    certification: "UA",
    language: "Telugu",
    languages: ["Telugu", "Hindi"],
    genres: ["Action", "Drama"],
    releaseDate: new Date("2024-09-27"),
    duration: 176,
    description:
      "A pre-independence saga of warring coastal clans and the man who tries to break the cycle of violence.",
    trailerUrl: "",
    isActive: true,
    isNowShowing: false,
    isFeatured: false,
  },
  // Coming-soon (not now-showing, future release)
  {
    title: "Avatar: Fire and Ash",
    poster: "https://image.tmdb.org/t/p/w500/g96wHxU7EnoIFwemb2RgohIXrgW.jpg",
    rating: 0,
    votes: 0,
    certification: "UA",
    language: "English",
    languages: ["English", "Hindi"],
    genres: ["Sci-Fi", "Adventure"],
    releaseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60), // ~60 days from today
    duration: 195,
    description:
      "Jake Sully and Neytiri's story continues — new clans, new threats, the heart of Pandora at stake.",
    trailerUrl: "",
    isActive: true,
    isNowShowing: false,
    isFeatured: false,
  },
  {
    title: "Spider-Man: Beyond the Spider-Verse",
    poster: "https://image.tmdb.org/t/p/w500/4goL6NMtUXYUDjI9N8CUBk9SrEt.jpg",
    rating: 0,
    votes: 0,
    certification: "U",
    language: "English",
    languages: ["English", "Hindi"],
    genres: ["Animation", "Action"],
    releaseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90), // ~90 days from today
    duration: 130,
    description: "Miles Morales' story continues across the Spider-Verse.",
    trailerUrl: "",
    isActive: true,
    isNowShowing: false,
    isFeatured: false,
  },
];

// ---------- F&B menu ----------

const fnbData = [
  // Popcorn
  { name: "Salted Popcorn (Small)", description: "Classic salted popcorn — fresh-popped.", price: 150, category: "popcorn", veg: true, isAvailable: true, image: "" },
  { name: "Salted Popcorn (Medium)", description: "More to share.", price: 200, category: "popcorn", veg: true, isAvailable: true, image: "" },
  { name: "Salted Popcorn (Large)", description: "Family bucket.", price: 250, category: "popcorn", veg: true, isAvailable: true, image: "" },
  { name: "Caramel Popcorn (Medium)", description: "Sweet caramelised popcorn.", price: 220, category: "popcorn", veg: true, isAvailable: true, image: "" },
  { name: "Caramel Popcorn (Large)", description: "Sweet caramel — large bucket.", price: 280, category: "popcorn", veg: true, isAvailable: true, image: "" },

  // Drinks
  { name: "Coca-Cola (Regular)", description: "Chilled cola — 350ml.", price: 100, category: "drinks", veg: true, isAvailable: true, image: "" },
  { name: "Coca-Cola (Large)", description: "Chilled cola — 600ml.", price: 150, category: "drinks", veg: true, isAvailable: true, image: "" },
  { name: "Mineral Water", description: "500ml bottled.", price: 60, category: "drinks", veg: true, isAvailable: true, image: "" },
  { name: "Hot Coffee", description: "Freshly brewed.", price: 100, category: "drinks", veg: true, isAvailable: true, image: "" },

  // Snacks
  { name: "Nachos with Cheese", description: "Crispy nachos, cheesy dip.", price: 220, category: "snacks", veg: true, isAvailable: true, image: "" },
  { name: "Veg Burger", description: "Crispy patty, fresh veggies.", price: 180, category: "snacks", veg: true, isAvailable: true, image: "" },
  { name: "Veg Hot Dog", description: "Soft bun, spicy filling.", price: 160, category: "snacks", veg: true, isAvailable: true, image: "" },
  { name: "Chicken Nuggets (6 pcs)", description: "Crispy chicken nuggets.", price: 220, category: "snacks", veg: false, isAvailable: true, image: "" },

  // Combos
  { name: "Couple Combo", description: "2 medium popcorn + 2 medium colas.", price: 550, category: "combo", veg: true, isAvailable: true, image: "" },
  { name: "Family Combo", description: "Large popcorn + 2 colas + nachos.", price: 750, category: "combo", veg: true, isAvailable: true, image: "" },
  { name: "Movie Mate Combo", description: "Medium caramel popcorn + cola + chocolate.", price: 380, category: "combo", veg: true, isAvailable: true, image: "" },
];

// ---------- Coupons ----------

const couponsData = [
  {
    code: "WELCOME50",
    type: "percent",
    value: 25,
    minTotal: 200,
    maxDiscount: 100,
    firstBookingOnly: true,
    isActive: true,
  },
  {
    code: "WEEKEND10",
    type: "percent",
    value: 10,
    minTotal: 300,
    maxDiscount: 50,
    firstBookingOnly: false,
    isActive: true,
  },
  {
    code: "IMAX100",
    type: "flat",
    value: 100,
    minTotal: 500,
    firstBookingOnly: false,
    isActive: true,
  },
  {
    code: "POPCORN20",
    type: "percent",
    value: 20,
    minTotal: 400,
    maxDiscount: 80,
    firstBookingOnly: false,
    isActive: true,
  },
];

// ---------- Banner ----------

const bannersData = [
  {
    title: "Festive Offers — Save up to ₹100",
    image: "https://placehold.co/1600x400/0b0f19/dc2626?text=Festive+Offers+%E2%80%94+Save+%E2%82%B9100&font=montserrat",
    ctaText: "Browse movies",
    ctaUrl: "/movies",
    position: "strip",
    sortOrder: 0,
    isActive: true,
  },
];

const TIME_SLOTS = ["10:00", "13:30", "17:00", "20:30"];

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI in env");
    process.exit(1);
  }
  const conn = await mongoose.connect(uri, { dbName: DB_NAME });
  console.log(`Connected to MongoDB — DB: ${conn.connection.name}`);
}

async function cleanupOrphanTestDb() {
  const testDb = mongoose.connection.useDb("test", { useCache: true });
  const collsToCheck = [
    "cinemas", "screens", "seatings", "movies", "shows",
    "bookings", "users", "clients", "admins", "fnbitems",
    "coupons", "banners", "auditlogs", "wishlists", "movienotifications",
    "reviews",
  ];
  let dropped = 0;
  for (const name of collsToCheck) {
    try {
      await testDb.collection(name).drop();
      dropped += 1;
    } catch (err) {
      if (err?.codeName !== "NamespaceNotFound" && err?.code !== 26) {
        console.warn(`  ⚠ could not drop test.${name}: ${err.message}`);
      }
    }
  }
  if (dropped > 0) {
    console.log(`✓ cleaned up ${dropped} orphan collection(s) from default 'test' DB`);
  }
}

async function isAlreadySeeded() {
  return (await Movie.countDocuments()) > 0;
}

async function wipeSeedables() {
  console.log("--force: wiping cinemas, screens, seatings, movies, shows, fnb, coupons, banners (users + bookings preserved)…");
  await Promise.all([
    Cinema.deleteMany({}),
    Screen.deleteMany({}),
    Seating.deleteMany({}),
    Movie.deleteMany({}),
    Show.deleteMany({}),
    FnbItem.deleteMany({}),
    Coupon.deleteMany({}),
    Banner.deleteMany({}),
  ]);
}

function dateNDaysFromNow(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

async function ensureUser({ email, password, role, firstname, lastname, number, gender, city }) {
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`✓ User exists: ${email} (role=${existing.role})`);
    return existing;
  }
  const hashed = await bcrypt.hash(password, 10);
  const u = await User.create({
    firstname, lastname, email, password: hashed,
    number, gender, city, role,
    isActive: true,
  });
  console.log(`✓ Created user: ${email}`);
  return u;
}

async function seed() {
  // 1. Posters
  console.log("Uploading posters to R2…");
  const posterUrls = {
    kalki: await uploadPoster("kalki.jpg", "posters/seed-kalki.jpg",
      placeholderPoster("Kalki 2898 AD", "2024")),
    martye: await uploadPoster("martye.jpg", "posters/seed-martye.jpg",
      placeholderPoster("Martyr", "2025")),
    ramayana: await uploadPoster("ramayana.jpg", "posters/seed-ramayana.jpg",
      placeholderPoster("Ramayana", "2025")),
  };

  // 2. Cinemas
  const cinemas = await Cinema.insertMany(cinemasData);
  console.log(`✓ ${cinemas.length} cinemas`);

  // 3. Seating layouts (sequential — pre-validate id hook)
  const layouts = [];
  for (const data of seatingLayoutsData) {
    layouts.push(await Seating.create(data));
  }
  console.log(`✓ ${layouts.length} seating layouts`);
  const [LAY_STD, LAY_PREM, LAY_IMAX, LAY_REC, LAY_VIP] = layouts;

  // 4. Screens
  const screens = await Screen.insertMany([
    // Cinépolis Alpha One
    { cinemaId: cinemas[0]._id, name: "Audi 1 - Standard", seatingPlanId: LAY_STD._id },
    { cinemaId: cinemas[0]._id, name: "Audi 2 - Gold", seatingPlanId: LAY_PREM._id },
    { cinemaId: cinemas[0]._id, name: "IMAX", seatingPlanId: LAY_IMAX._id },
    // PVR INOX Acropolis
    { cinemaId: cinemas[1]._id, name: "Audi 1", seatingPlanId: LAY_STD._id },
    { cinemaId: cinemas[1]._id, name: "Recliner Lounge", seatingPlanId: LAY_REC._id },
    // Carnival Cinemas Himalaya
    { cinemaId: cinemas[2]._id, name: "Audi 1", seatingPlanId: LAY_STD._id },
    { cinemaId: cinemas[2]._id, name: "IMAX", seatingPlanId: LAY_IMAX._id },
    { cinemaId: cinemas[2]._id, name: "VIP Lounge", seatingPlanId: LAY_VIP._id },
  ]);
  console.log(`✓ ${screens.length} screens`);

  // 5. Movies
  const movies = await Movie.insertMany(buildMoviesData(posterUrls));
  console.log(`✓ ${movies.length} movies`);

  // Index movies by title for show generation
  const m = (title) => movies.find((x) => x.title === title);

  // 6. Shows — only for now-showing movies, varied across the next 7 days
  // Each show: { movieIdx, screenIdx, timeIdx } where screenIdx is into `screens`
  // and timeIdx is into TIME_SLOTS.
  const dailyShowTemplate = [
    // Hot picks — multiple cinemas, peak slots
    { movieTitle: "Kalki 2898 AD",                screenIdx: 2, timeIdx: 0, format: "IMAX",       language: "Telugu", subtitles: "English" },
    { movieTitle: "Kalki 2898 AD",                screenIdx: 6, timeIdx: 1, format: "IMAX",       language: "Hindi",  subtitles: "" },
    { movieTitle: "Pushpa 2: The Rule",           screenIdx: 0, timeIdx: 2, format: "2D",         language: "Hindi",  subtitles: "" },
    { movieTitle: "Pushpa 2: The Rule",           screenIdx: 5, timeIdx: 3, format: "2D",         language: "Telugu", subtitles: "" },
    { movieTitle: "Ramayana",                     screenIdx: 4, timeIdx: 2, format: "2D",         language: "Hindi",  subtitles: "" },
    { movieTitle: "Ramayana",                     screenIdx: 0, timeIdx: 0, format: "2D",         language: "Hindi",  subtitles: "" },
    { movieTitle: "Martyr",                       screenIdx: 1, timeIdx: 1, format: "2D",         language: "Hindi",  subtitles: "" },
    { movieTitle: "Inception",                    screenIdx: 5, timeIdx: 2, format: "2D",         language: "English", subtitles: "Hindi" },
    { movieTitle: "Dune: Part Two",               screenIdx: 2, timeIdx: 3, format: "IMAX",       language: "English", subtitles: "" },
    { movieTitle: "Oppenheimer",                  screenIdx: 6, timeIdx: 3, format: "IMAX",       language: "English", subtitles: "" },
    { movieTitle: "3 Idiots",                     screenIdx: 3, timeIdx: 1, format: "2D",         language: "Hindi",  subtitles: "" },
    { movieTitle: "Pathaan",                      screenIdx: 7, timeIdx: 3, format: "Dolby Atmos", language: "Hindi", subtitles: "" },
  ];

  const showsPayload = [];
  for (let day = 0; day < 7; day++) {
    const date = dateNDaysFromNow(day);
    for (const slot of dailyShowTemplate) {
      const movie = m(slot.movieTitle);
      if (!movie) continue;
      showsPayload.push({
        movieId: movie._id,
        screenId: screens[slot.screenIdx]._id,
        date,
        time: TIME_SLOTS[slot.timeIdx],
        format: slot.format,
        language: slot.language,
        subtitles: slot.subtitles,
        bookedSeats: [],
      });
    }
  }
  const shows = await Show.insertMany(showsPayload);
  console.log(`✓ ${shows.length} shows`);

  // 7. F&B (chain-wide — cinemaId null)
  const fnb = await FnbItem.insertMany(fnbData);
  console.log(`✓ ${fnb.length} F&B items`);

  // 8. Coupons
  for (const c of couponsData) {
    await Coupon.create(c);
  }
  console.log(`✓ ${couponsData.length} coupon codes`);

  // 9. Banner
  await Banner.insertMany(bannersData);
  console.log(`✓ ${bannersData.length} banner`);

  return { cinemas, layouts, screens, movies, shows, fnb };
}

(async () => {
  try {
    await connect();

    if (!r2Configured()) {
      console.warn(
        "\n⚠️  R2 is not configured. Posters will use placehold.co fallback URLs.\n"
      );
    }

    await cleanupOrphanTestDb();

    // Always ensure both users (admin + a regular test user)
    const admin = await ensureUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
      firstname: "Admin",
      lastname: "User",
      number: "9999999999",
      gender: "other",
      city: "Ahmedabad",
    });
    const testUser = await ensureUser({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      role: "user",
      firstname: "Test",
      lastname: "User",
      number: "9000000001",
      gender: "other",
      city: "Ahmedabad",
    });

    if (await isAlreadySeeded()) {
      if (!FORCE) {
        console.log(
          "\nDatabase already has movies. Skipping reseed.\n" +
            "Re-run with --force to wipe and reseed (users + bookings preserved)."
        );
        await mongoose.disconnect();
        process.exit(0);
      }
      await wipeSeedables();
    }

    const { cinemas, layouts, screens, movies, shows, fnb } = await seed();

    console.log("\n────────────────────────────────────────────────");
    console.log("✨ Seed complete");
    console.log("────────────────────────────────────────────────");
    console.log(`  Admin:    ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log(`  Test:     ${TEST_USER_EMAIL} / ${TEST_USER_PASSWORD}`);
    console.log(`  Cinemas:  ${cinemas.length}  (Ahmedabad)`);
    console.log(`  Layouts:  ${layouts.length}`);
    console.log(`  Screens:  ${screens.length}`);
    console.log(`  Movies:   ${movies.length}`);
    console.log(`  Shows:    ${shows.length}  (next 7 days)`);
    console.log(`  F&B:      ${fnb.length}  items`);
    console.log(`  Coupons:  ${couponsData.length}  (WELCOME50, WEEKEND10, IMAX100, POPCORN20)`);
    console.log(`  Banners:  ${bannersData.length}`);
    console.log(`  Admin id: ${admin._id}`);
    console.log(`  User id:  ${testUser._id}`);
    console.log("────────────────────────────────────────────────\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    try { await mongoose.disconnect(); } catch (_) {}
    process.exit(1);
  }
})();
