import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { CityProvider } from "./context/CityContext";
import RequireAuth from "./components/auth/RequireAuth";
import RouteFallback from "./components/Layout/RouteFallback";
import ScrollToTop from "./components/Layout/ScrollToTop";

// LCP-critical pages: keep eagerly imported so the initial paint isn't
// blocked on a network round-trip for the route chunk.
import Home from "./pages/Home.jsx";
import Movies from "./components/Movies/Movies";
import MovieDetailsPage from "./pages/MovieDetailsPage";

// Admin layout (the shell) stays eager; only the children inside it lazy-load
// so the admin tree is never pulled into the public bundle.
import AdminLayout from "./components/Admin/AdminLayout";

// Lower-traffic public pages
const Login = lazy(() => import("./components/login/login"));
const Signup = lazy(() => import("./components/singup/Signup"));
const PublicTicket = lazy(() => import("./pages/PublicTicket"));
const Help = lazy(() => import("./pages/Help"));
const ComingSoon = lazy(() => import("./pages/ComingSoon"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Search = lazy(() => import("./pages/Search"));
const ShowSeats = lazy(() => import("./pages/ShowSeats"));

// Themed error pages
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const Forbidden = lazy(() => import("./pages/Forbidden"));
const ServerError = lazy(() => import("./pages/ServerError"));
const NotFound = lazy(() => import("./pages/NotFound"));

// User-only (heavy / behind auth)
const Proceedtopay = lazy(() => import("./components/nowshowing/Proceedtopay"));
const BookingSuccess = lazy(() => import("./pages/BookingSuccess"));
const AccountProfile = lazy(() => import("./pages/account/AccountProfile"));
const MyTickets = lazy(() => import("./pages/account/MyTickets"));
const Profile = lazy(() => import("./pages/account/Profile"));
const Security = lazy(() => import("./pages/account/Security"));
const Danger = lazy(() => import("./pages/account/Danger"));
const Wishlist = lazy(() => import("./pages/account/Wishlist"));
const Notifications = lazy(() => import("./pages/account/Notifications"));

// Admin (every admin page is split off — public users never download these)
const AdminPanel = lazy(() => import("./components/Admin/AdminPanel"));
const ShowCreate = lazy(() => import("./components/Admin/ShowCreate"));
const AddMoviePage = lazy(() => import("./components/addmovie/addmovie"));
const Seats = lazy(() => import("./pages/Seats"));
const SeatingEditor = lazy(() => import("./components/seatingCreation/SeatingEditor"));
const Cinemas = lazy(() => import("./pages/admin/Cinemas"));
const Screens = lazy(() => import("./pages/admin/Screens"));
const AdminMovies = lazy(() => import("./pages/admin/Movies"));
const AdminShows = lazy(() => import("./pages/admin/Shows"));
const AdminBookings = lazy(() => import("./pages/admin/Bookings"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const Fnb = lazy(() => import("./pages/admin/Fnb"));
const Coupons = lazy(() => import("./pages/admin/Coupons"));
const AdminReviews = lazy(() => import("./pages/admin/Reviews"));
const ValidateTicket = lazy(() => import("./pages/admin/ValidateTicket"));
const AuditLog = lazy(() => import("./pages/admin/AuditLog"));
const Banners = lazy(() => import("./pages/admin/Banners"));

function App() {
  return (
    <AuthProvider>
      <CityProvider>
        <Router>
          <ScrollToTop />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* ========================= PUBLIC ========================= */}
              <Route path="/" element={<Home />} />

              <Route path="/auth">
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<Signup />} />
              </Route>

              {/* Browse + detail + seat-picker (seat-picker stays public; only
                  checkout is gated). */}
              <Route path="/movies">
                <Route index element={<Movies />} />
                <Route path=":movieId" element={<MovieDetailsPage />} />
              </Route>

              {/* Public seat picker — checkout below is gated, but seat
                  selection itself stays public. */}
              <Route path="/show/:showId/seats" element={<ShowSeats />} />

              {/* Info / static */}
              <Route path="/coming-soon" element={<ComingSoon />} />
              <Route path="/help" element={<Help />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/search" element={<Search />} />

              {/* Public sharable ticket */}
              <Route path="/t/:id" element={<PublicTicket />} />

              {/* Themed error pages — reachable directly + by redirect */}
              <Route path="/401" element={<Unauthorized />} />
              <Route path="/403" element={<Forbidden />} />
              <Route path="/500" element={<ServerError />} />

              {/* ========================= USER ========================= */}
              <Route element={<RequireAuth />}>
                <Route path="/booking/:showId" element={<Proceedtopay />} />
                <Route
                  path="/booking/:bookingId/success"
                  element={<BookingSuccess />}
                />
                <Route path="/account">
                  <Route index element={<AccountProfile />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="tickets" element={<MyTickets />} />
                  <Route path="wishlist" element={<Wishlist />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="security" element={<Security />} />
                  <Route path="danger" element={<Danger />} />
                </Route>
              </Route>

              {/* ========================= ADMIN ========================= */}
              <Route element={<RequireAuth role="admin" />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminPanel />} />
                  <Route path="movies" element={<AdminMovies />} />
                  <Route path="movies/new" element={<AddMoviePage />} />
                  {/* Legacy alias — redirect old links to the canonical path. */}
                  <Route
                    path="addmovies"
                    element={<Navigate to="/admin/movies/new" replace />}
                  />
                  <Route path="cinemas" element={<Cinemas />} />
                  <Route path="screens" element={<Screens />} />
                  <Route path="seating">
                    <Route index element={<Seats />} />
                    <Route path="edit/:id" element={<SeatingEditor />} />
                  </Route>
                  <Route path="shows" element={<AdminShows />} />
                  <Route path="shows/new" element={<ShowCreate />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="fnb" element={<Fnb />} />
                  <Route path="coupons" element={<Coupons />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="validate" element={<ValidateTicket />} />
                  <Route path="audit" element={<AuditLog />} />
                  <Route path="banners" element={<Banners />} />
                </Route>
              </Route>

              {/* 404 catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </CityProvider>
    </AuthProvider>
  );
}

export default App;
