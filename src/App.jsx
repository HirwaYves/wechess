// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Home from './pages/home';
import About from './pages/about';
import Tournaments from './pages/tournaments';
import Register from './pages/register';
import Contact from './pages/contact';
import Privacy from './pages/privacy';
import Terms from './pages/terms';
import Login from './pages/login';
import Profile from './pages/profile';
import Leaderboard from './pages/Leaderboard';
import ProtectedRoute from './components/protectedRoute';

// Admin layout and pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin';
import ManageTournaments from './pages/admin/ManageTournaments';
import ManagePlayers from './pages/admin/ManagePlayers';
import ManageRegistrations from './pages/admin/ManageRegistrations';
import SubmitMatch from './pages/admin/SubmitMatch';
import CreateTournament from './pages/admin/CreateTournament';
import ManageSeasons from './pages/admin/ManageSeasons';

import './App.css';

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* User profile (protected) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin routes – all protected and require admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="seasons" element={<ManageSeasons />} />
            <Route path="tournaments" element={<ManageTournaments />} />
            <Route path="players" element={<ManagePlayers />} />
            <Route path="registrations" element={<ManageRegistrations />} />
            <Route path="submit-match" element={<SubmitMatch />} />
            <Route path="create-tournament" element={<CreateTournament />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;