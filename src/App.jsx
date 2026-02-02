import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MarketingPage from './pages/MarketingPage';
import SignInSide from './pages/SignInSide';
import SignUp from './pages/SignUp';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Market from './pages/Market';
import Portfolio from './pages/Portfolio';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MarketingPage />}/>
        <Route path="/signin" element={<SignInSide />}/>
        <Route path="/signup" element={<SignUp />}/>

        {/* Protected Dashboard Routes with MainLayout */}
        <Route path="/home" element={<MainLayout />}>
          <Route index element={<Dashboard />} /> {/* Default: /home shows Dashboard */}
          <Route path="market" element={<Market />} /> {/* /home/market */}
          <Route path="portfolio" element={<Portfolio />} /> {/* /home/portfolio */}
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;