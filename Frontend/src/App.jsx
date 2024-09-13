import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  RouterProvider,
} from "react-router-dom";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Seat from "./pages/Seats";
import Seats2 from "./pages/Seats2";
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/signup" element={<Signup/>} />
          <Route path="/admin" element={<Seat/>} />
          <Route path="/seating" element={<Seats2/>} />

        </Routes>
      </Router>
    </>
  );
}


export default App;
