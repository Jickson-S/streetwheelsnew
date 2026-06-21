import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Otp from "./pages/Otp";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import CarDetails from "./pages/CarDetails";
import Booking from "./pages/Booking";
import Profile from "./pages/Profile";

import AdminLogin from "./admin/Login";
import Dashboard from "./admin/Dashboard";
import AdminCars from "./admin/Cars";
import Bookings from "./admin/Bookings";
import Trips from "./admin/Trips";
import AddCar from "./admin/AddCar";
import Whatsapp from "./admin/Whatsapp";

import CompleteProfile from "./pages/CompleteProfile";
import BookingDetails from "./pages/BookingDetails";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import UsersList from "./admin/Users";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/home" element={<Home />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/car/:id" element={<CarDetails />} />
        <Route path="/booking/:id" element={<Booking />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/cars" element={<AdminCars />} />
        <Route path="/admin/bookings" element={<Bookings />} />
        <Route path="/admin/trips" element={<Trips />} />
        <Route path="/admin/add-car" element={<AddCar />} />
        <Route path="/admin/users" element={<UsersList />} />
        <Route path="/admin/whatsapp" element={<Whatsapp />} />

        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/booking-details/:id" element={<BookingDetails />} />
        <Route path="*" element={<NotFound />} />



      </Routes>
    </BrowserRouter>
  );
}

export default App;