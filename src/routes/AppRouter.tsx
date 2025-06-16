// src/routes/AppRouter.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Admin from '../pages/Admin';
import Workshop from '../pages/Workshop';
import VehicleDetail from '../pages/VehicleDetail';
import NotFound from '../pages/NotFound';
import Header from '../components/Header';

const AppRouter = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/workshop" element={<Workshop />} />
        <Route path="/vehicle/:tokenId" element={<VehicleDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
