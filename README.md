# 🎬 MovieVista — Multi-City Cinema Booking System

MovieVista is a full-stack, multi-city cinema booking platform. End users browse showings across cities, pick seats on a real seating plan, and check out their tickets. Admins manage the entire catalogue: cinemas, screens, seating plans, movies, shows, bookings, and users.

---

## 🛠️ Tech Stack

**Backend**
- Express 4 (REST API)
- MongoDB Atlas via Mongoose 8
- Cloudflare R2 for object storage (movie posters / uploads) via the AWS S3 SDK
- JWT cookie auth with role-based access control
- `cookie-parser`, `cors`, `morgan`, `express-rate-limit`

**Frontend**
- Vite + React 18
- TailwindCSS + shadcn/ui (Radix primitives)
- framer-motion for transitions
- `axios` (centralized client at `src/lib/api.js`, `withCredentials` on)
- `react-hot-toast` for feedback, `react-router-dom` v6

---

## 🏛️ Architecture

Monorepo with two top-level apps:

```
new folders/
├── Backend/        # Express API (port 8000)
│   ├── app.js
│   ├── index.js
│   ├── scripts/seed.js
│   └── src/
│       ├── controller/
│       ├── db/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── utils/    # asyncHandler, ApiError (apierror.js), ApiResponse (apiresponce.js)
└── Frontend/       # Vite + React (port 5173)
    └── src/
        ├── components/
        ├── pages/
        ├── lib/api.js
        └── ...
```

### Key entities

- **Cinema** — a venue in a city (name, city, address).
- **Screen** — a hall inside a cinema, attached to a `SeatingPlan`.
- **SeatingPlan** (`Seating`) — reusable layout with sections (Platinum / Gold / Silver), rows × columns, prices, unavailable seats.
- **Movie** — title, poster, genres, languages, rating, certification, flags (`isNowShowing`, `isFeatured`).
- **Show** — a `Movie` × `Screen` × `date` × `time` instance, tracks `bookedSeats`.
- **Booking** — a user's confirmed seats on a show, with totals and status.
- **User** — auth + role (`user` | `admin`).

### Roles

- **`user`** — browse movies/shows, pick seats, book tickets, view their own bookings.
- **`admin`** — full CRUD on cinemas, screens, seating plans, movies, shows, bookings, and users.

Role gating is enforced on the backend with `isAuthenticated` + `requireRole("admin")` middlewares.

---

## 🚀 Setup

### Prerequisites
- Node.js 18+
- A MongoDB Atlas connection string (a local Mongo also works)
- Cloudflare R2 credentials (only needed for poster/image uploads — the app runs without them, you just can't upload through the admin UI)

### 1. Clone

```bash
git clone <your-repo-url>
cd "new folders"
```

### 2. Backend env

Create `Backend/.env` (see `Backend/.env.example` if present):

```env
PORT=8000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net
JWT_SECRET=replace-me-with-a-long-random-string
CLIENT_URL=http://localhost:5173

# Cloudflare R2 (optional — only for image uploads)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=
```

### 3. Frontend env

Create `Frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3100/api/v1
```

### 4. Install + run

```bash
# Backend
cd Backend
npm install
npm run seed       # one-time: seeds cinemas, screens, seating, movies, shows
npm start          # http://localhost:3100

# Frontend (new terminal)
cd Frontend
npm install
npm run dev        # http://localhost:5173
```

`npm run seed` is idempotent: it skips if `Movie.countDocuments() > 0`. To wipe and reseed (cinemas, screens, seating, movies, shows — users and bookings are preserved):

```bash
npm run seed:force
```

---

## 👤 First admin (Atlas-flip)

There is no public "register as admin" endpoint by design. To create the first admin:

1. Sign up through the UI as a normal user.
2. Open MongoDB Atlas → `ticket-booking` → `users` collection.
3. Edit your user document and change `role` from `"user"` to `"admin"`.
4. Log out and log back in. You now see the admin area.

After that, **Phase 6 added an admin Users page**, so you can promote/demote any other user from inside the app — no more Atlas trips.

---

## ✨ Feature highlights

### User side
- Browse "Now Showing" + "Coming Soon" movies, with featured carousel
- City picker — see only cinemas/shows in your city
- Movie detail page with showtimes grouped by cinema and date
- Interactive seat selection on the actual auditorium layout (Platinum / Gold / Silver)
- Login / signup with JWT cookies, "My Tickets" page for booking history
- Toast feedback throughout, mobile-friendly via Tailwind

### Admin side
- Dashboard + side panel navigation
- CRUD for: Movies, Cinemas, Screens, Seating Plans, Shows, Bookings, Users
- Visual seating plan editor (toggle individual seats unavailable)
- Image uploads through Cloudflare R2 (presigned PUTs)
- Role management for other users

---

## 🧭 API surface

All routes are mounted under `/api/v1`:

| Tree         | Purpose                                              |
| ------------ | ---------------------------------------------------- |
| `/users`     | Signup, login, logout, current user, profile, roles  |
| `/movies`    | Movie CRUD + listing (now showing, featured)         |
| `/shows`     | Show CRUD + lookup by movie/cinema/date              |
| `/cinemas`   | Cinema CRUD, list by city                            |
| `/screens`   | Screen CRUD, list by cinema                          |
| `/bookings`  | Create booking, list own / all bookings              |
| `/seating`   | Seating plan CRUD, fetch layout for a show           |
| `/uploads`   | Presigned URL generation for R2 uploads              |
| `/admin`     | Admin-only utilities (analytics, etc.)               |

---

## 🗺️ Project status

- ✅ **Phases 1–7 complete** — auth, models, admin CRUD, public browsing, seat selection, booking flow, payment-stub + confirmation, R2 uploads, polish (centralized API client, error pages, seed script, README).
- ⏳ **Pending** — real payment gateway integration (Razorpay / Stripe), production deployment (Render / Vercel / Fly).

---

## 🤝 Contributing

PRs welcome. Open an issue first if you're proposing a non-trivial change so we can align on scope.

---

## 📞 Contact

For any queries or support, please contact:

🎥 Movies Development Team — jaldipvekariya@gmail.com
