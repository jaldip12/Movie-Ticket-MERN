import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/singup/Signup";
import Home from "./pages/Home.jsx";
import Login from "../src/components/login/login";
// import AdminP from "./pages/AdminP";
import Seats from "./pages/Seats";
import Movies from "./components/Movies/Movies";
import { NowShowing } from "./components/nowshowing/NowShowing";
import AdminPanel from "./components/Admin/AdminPanel";
import SeatingEditor from "./components/seatingCreation/SeatingEditor";
import ShowCreate from "./components/Admin/ShowCreate";
import MovieDetailsPage from "./pages/MovieDetailsPage";
// import AdminLogin from "./components/Admin/AdminLogin";
import AdminLayout from "./components/Admin/AdminLayout";
import AddMoviePage from "./components/addmovie/AddMovie";
import MovieBookingPage from "../src/components/nowshowing/Booking"
// import UserContextProvider from "./context/userContextProvider";
import Proceedtopay from "./components/nowshowing/Proceedtopay";
import Pyment from "./components/nowshowing/Pyment";
function App() {
  return (
    // <UserContextProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/auth">
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
          </Route>

          {/* Movies Section */}
          <Route path="/movies">
            <Route index element={<Movies />} />
            <Route path=":movieId">
              <Route index element={<MovieDetailsPage />} />
              <Route path="booking" element={<MovieBookingPage />} />
              <Route path="booking/conformation" element={<Pyment/>} />
            </Route>
          </Route>
          <Route path="booking/:showId" element={<Proceedtopay/>}></Route>
          {/* <Route path="movies/booking/conformation" element={<Pyment/>} /> */}
          
          {/* Admin Section */}
          <Route path="/admin">
            
            
              <Route element={<AdminLayout />}>
                <Route index element={<AdminPanel />} />
                <Route path="seating">
                  <Route index element={<Seats />} />
                  <Route path="edit/:id" element={<SeatingEditor />} />
                </Route>
                <Route path="shows" element={<ShowCreate />} />
                <Route path="movies" element={<NowShowing />} />
                <Route path="addmovies" element={<AddMoviePage />} />

              </Route>
            </Route>
          
        </Routes>
      </Router>
    // </UserContextProvider>
  );
}

export default App;
