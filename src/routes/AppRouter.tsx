// src/routes/AppRouter.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Admin from '../pages/Admin';
import Workshop from '../pages/Workshop';
import VehicleDetail from '../pages/VehicleDetail';
import NotFound from '../pages/NotFound';
import Header from '../components/Header';
import RequireRole from '../components/RequireRole';
import { useWallet } from '../hooks/useWallet';
import { useRole } from '../hooks/useRole';

const AppRouter = () => {
  const { account } = useWallet();
  const role = useRole(account); // 'admin' | 'workshop' | 'user' | 'guest'

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vehicle/:tokenId" element={<VehicleDetail />} />

        {/* 역할 제한: admin만 접근 가능 */}
        <Route
          path="/admin"
          element={
            <RequireRole role="admin" current={role}>
              <Admin />
            </RequireRole>
          }
        />

        {/* 역할 제한: workshop만 접근 가능 */}
        <Route
          path="/workshop"
          element={
            <RequireRole role="workshop" current={role}>
              <Workshop />
            </RequireRole>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
