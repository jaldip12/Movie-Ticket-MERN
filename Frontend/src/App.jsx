import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Signup from "./components/singup/Signup";
import Home from "./pages/Home.jsx";
import Login from "../src/components/login/login";
import Seat from "./pages/Seats";
import Seats2 from "./pages/Seats2";
import Tickets from "./pages/Tickets";
import Movies from "./components/Movies/Movies";
import { NowShowing } from "./components/nowshowing/NowShowing";
import Billing from "./pages/Billing";
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<Seat />} />
          <Route path="/seating" element={<Seats2 />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/Movies" element={<Movies />} />
          <Route path="/Movies/:movieTitle" element={<Tickets />} />
          <Route path="/Movies/:movieTitle/billing" element={<Billing />} />
          <Route path="/now-showing" element={<NowShowing />} />
          
        </Routes>
      </Router>
    </>
  );
}

export default App;
