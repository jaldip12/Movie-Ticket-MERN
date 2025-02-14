import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/singup/Signup";
import Home from "./pages/Home.jsx";
import Login from "../src/components/login/login";
import AdminP from "./pages/AdminP";
import Seats from "./pages/Seats";
import Movies from "./components/Movies/Movies";
import { NowShowing } from "./components/nowshowing/NowShowing";
import  AdminPanel  from "./components/Admin/AdminPanel";
import Billing from "./pages/Billing";
import SeatingEditor from "./components/seatingCreation/SeatingEditor";
import ShowCreate from "./components/Admin/ShowCreate";
import MovieDetailsPage from "./pages/MovieDetailsPage";
function App() {
  return (
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
          <Route path=":movieTitle">
            <Route index element={<MovieDetailsPage />} />
            <Route path="billing" element={<Billing />} />
          </Route>
        </Route>

        {/* Admin Section */}
        <Route path="/admin">
          <Route path="login" element={<Login />} />
          <Route element={<AdminP />}></Route>
          <Route index element={<AdminPanel />} />
          <Route path="seating">
            <Route index element={<Seats />} />
            <Route path="edit/:id" element={<SeatingEditor />} />
          </Route>
          <Route path="shows" element={<ShowCreate />} />
          <Route path="movies" element={<NowShowing />} />
        </Route>
        
      </Routes>
    </Router>
  );
}

export default App;
