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
        {/* 모든 사용자 접근 가능 */}
        <Route path="/" element={<Home />} />
        <Route path="/vehicle/:tokenId" element={<VehicleDetail />} />

        {/* 관리자 전용 페이지 */}
        <Route
          path="/admin"
          element={
            <RequireRole required="admin" current={role}>
              <Admin />
            </RequireRole>
          }
        />

        {/* 정비소 전용 페이지 */}
        <Route
          path="/workshop"
          element={
            <RequireRole required="workshop" current={role}>
              <Workshop />
            </RequireRole>
          }
        />

        {/* 잘못된 경로 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
