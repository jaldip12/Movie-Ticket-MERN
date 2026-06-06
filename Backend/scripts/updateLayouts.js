/* eslint-disable no-console */
//
// One-shot migration: rewrite the 5 existing seating plans in the DB so they
// match the reference screenshots the user shared. Idempotent — safe to run
// repeatedly. Run from project root:
//
//   node Backend/scripts/updateLayouts.js
//
// or from Backend/:
//
//   node scripts/updateLayouts.js
//
// Requires MONGODB_URI in env (same as seed.js). Updates by `name`; creates
// the doc if missing.

import "dotenv/config";
import mongoose from "mongoose";
import Seating from "../src/models/Seating.model.js";

const DB_NAME = "ticket-booking";

// Helper: every seat in a row × col block as `seatTypes` of one type.
const allSeatsType = (rowLabels, cols, type) =>
  rowLabels.flatMap((row) =>
    Array.from({ length: cols }, (_, c) => ({ row, seat: c + 1, type }))
  );

// Each layout corresponds to one of the 5 reference screenshots. Sections are
// listed top→bottom (renderer convention: section[0] is the BACK of the hall,
// SCREEN sits below the last section). Row labels are explicit so labelling
// reads continuously across sections (e.g. M down to A).

const layouts = [
  // ─── Image 1: VIP / PREMIUM / EXECUTIVE / NORMAL ─────────────────────
  {
    name: "Standard Multiplex",
    sections: [
      {
        name: "VIP",
        rows: 1,
        columns: 12,
        price: 500,
        aisles: [2, 4, 6, 8, 10],
        rowLabels: ["M"],
      },
      {
        name: "PREMIUM",
        rows: 7,
        columns: 16,
        price: 290,
        aisles: [5, 10],
        rowLabels: ["L", "K", "J", "I", "H", "G", "F"],
      },
      {
        name: "EXECUTIVE",
        rows: 2,
        columns: 16,
        price: 240,
        aisles: [10],
        rowLabels: ["E", "D"],
      },
      {
        name: "NORMAL",
        rows: 3,
        columns: 20,
        price: 220,
        aisles: [4, 14],
        rowLabels: ["C", "B", "A"],
        // Front row A is one seat shorter in the reference (19 not 20).
        unavailableSeats: [{ row: "A", seats: [20] }],
        unavailableStyle: "hidden",
      },
    ],
  },

  // ─── Image 2: RECLINER / PRIME / CLASSIC ─────────────────────────────
  {
    name: "Recliner Lounge",
    sections: [
      {
        name: "RECLINER",
        rows: 1,
        columns: 12,
        price: 400,
        aisles: [2, 4, 6, 8, 10],
        rowLabels: ["A"],
        seatTypes: allSeatsType(["A"], 12, "recliner"),
      },
      {
        name: "PRIME",
        rows: 10,
        columns: 16,
        price: 200,
        aisles: [6],
        rowLabels: ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K"],
      },
      {
        name: "CLASSIC",
        rows: 3,
        columns: 16,
        price: 200,
        aisles: [6],
        rowLabels: ["L", "M", "N"],
      },
    ],
  },

  // ─── Image 3: RECLINER / EXECUTIVE / ROYAL / MARVEL ──────────────────
  {
    name: "Premium Gold Class",
    sections: [
      {
        name: "RECLINER",
        rows: 1,
        columns: 17,
        price: 390,
        aisles: [],
        rowLabels: ["A"],
        seatTypes: allSeatsType(["A"], 17, "recliner"),
      },
      {
        name: "EXECUTIVE",
        rows: 7,
        columns: 16,
        price: 220,
        aisles: [4, 12],
        rowLabels: ["B", "C", "D", "E", "F", "G", "H"],
      },
      {
        name: "ROYAL",
        rows: 3,
        columns: 8,
        price: 210,
        aisles: [],
        rowLabels: ["I", "J", "K"],
      },
      {
        name: "MARVEL",
        rows: 2,
        columns: 12,
        price: 190,
        aisles: [4],
        rowLabels: ["L", "M"],
      },
    ],
  },

  // ─── Image 4: RECLINER / PRIME PLUS / PRIME / CLASSIC ────────────────
  // Cinema convention in this hall: row letter "I" is skipped (looks like 1).
  {
    name: "7-Star VIP",
    sections: [
      {
        name: "RECLINER",
        rows: 1,
        columns: 13,
        price: 580,
        aisles: [],
        rowLabels: ["O"],
        seatTypes: allSeatsType(["O"], 13, "recliner"),
      },
      {
        name: "PRIME PLUS",
        rows: 6,
        columns: 16,
        price: 380,
        aisles: [9],
        rowLabels: ["N", "M", "L", "K", "J", "H"],
      },
      {
        name: "PRIME",
        rows: 4,
        columns: 12,
        price: 320,
        aisles: [9],
        rowLabels: ["G", "F", "E", "D"],
      },
      {
        name: "CLASSIC",
        rows: 3,
        columns: 12,
        price: 300,
        aisles: [9],
        rowLabels: ["C", "B", "A"],
      },
    ],
  },

  // ─── Image 5: IMAX — RECLINER / PRIME PLUS / PRIME / CLASSIC ─────────
  // The reference hall has a PICTURE PERFECT centre block within shared rows.
  // The data model only supports per-row sections, so we collapse it into
  // PRIME PLUS / PRIME tiers (closest visual approximation).
  {
    name: "IMAX Auditorium",
    sections: [
      {
        name: "RECLINER",
        rows: 1,
        columns: 16,
        price: 770,
        aisles: [4, 10, 13],
        rowLabels: ["M"],
        seatTypes: allSeatsType(["M"], 16, "recliner"),
      },
      {
        name: "PRIME PLUS",
        rows: 3,
        columns: 22,
        price: 520,
        aisles: [5, 13],
        rowLabels: ["L", "K", "J"],
      },
      {
        name: "PRIME",
        rows: 5,
        columns: 22,
        price: 410,
        aisles: [5, 13],
        rowLabels: ["H", "G", "F", "E", "D"],
      },
      {
        name: "CLASSIC",
        rows: 3,
        columns: 22,
        price: 390,
        aisles: [5, 13],
        rowLabels: ["C", "B", "A"],
      },
    ],
  },
];

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI in env");
    process.exit(1);
  }
  const conn = await mongoose.connect(uri, { dbName: DB_NAME });
  console.log(`Connected to MongoDB — DB: ${conn.connection.name}`);

  let updated = 0;
  let created = 0;
  for (const layout of layouts) {
    let doc = await Seating.findOne({ name: layout.name });
    if (doc) {
      doc.sections = layout.sections;
      await doc.save();
      updated += 1;
      console.log(
        `  ✓ updated "${layout.name}" — ${doc.sections.length} sections`
      );
    } else {
      doc = new Seating({ name: layout.name, sections: layout.sections });
      await doc.save();
      created += 1;
      console.log(
        `  ✓ created "${layout.name}" — id ${doc.id}, ${doc.sections.length} sections`
      );
    }
  }

  console.log(`\nDone. Updated ${updated}, created ${created}.`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Migration failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
