import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MarketingPage from './pages/MarketingPage';
import SignInSide from './pages/SignInSide';
import SignUp from './pages/SignUp';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Screener from './pages/Screener';
import Compare from './pages/Compare';
import FundDetail from './pages/FundDetail';
import Portfolio from './pages/Portfolio';
import Market from './pages/Market';
import Analytics from './pages/Analytics';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MarketingPage />} />
          <Route path="/signin" element={<SignInSide />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Dashboard Routes with MainLayout — no auth check for now */}
          <Route path="/home" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="screener" element={<Screener />} />
            <Route path="compare" element={<Compare />} />
            <Route path="fund/:id" element={<FundDetail />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="market" element={<Market />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;