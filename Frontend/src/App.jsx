import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Signup from "./components/singup/Signup";
import Home from "./pages/Home.jsx";
import Login from "../src/components/login/login";
import AdminP from "./pages/AdminP";
import Seats from "./pages/Seats";
import Tickets from "./pages/Tickets";
import Movies from "./components/Movies/Movies";
import { NowShowing } from "./components/nowshowing/NowShowing";
import { AdminPanel } from "./components/Admin/AdminPanel";
import Billing from "./pages/Billing";
function App() {
  return (
    <>        
      <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminP />}>
          <Route index element={<AdminPanel />} />
          <Route path="seating" element={<Seats />} />
          <Route path="movies" element={<NowShowing />} />
        </Route>
        
        <Route path="/Movies" element={<Movies />} />
        <Route path="/Movies/:movieTitle" element={<Tickets />} />
        <Route path="/Movies/:movieTitle/billing" element={<Billing />} />
       
      </Routes>
    </Router>
    </>
  );
}

export default App;
