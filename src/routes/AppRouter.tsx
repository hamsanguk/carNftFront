// src/routes/AppRouter.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Admin from '../pages/Admin';
import Workshop from '../pages/Workshop';
import VehicleDetail from '../pages/VehicleDetail';
import NotFound from '../pages/NotFound';
import Header from '../components/Header';
import RequireRole from '../components/RequireRole';
import { useWallet } from '../contexts/WalletContext';
import { useRole } from '../contexts/RoleContext';

const AppRouter = () => {
  const { role } = useRole(); // 컨텍스트에서 role 직접 가져오기


  return (
    <Router>
      <Header />
      <Routes>
        {/* 모든 사용자 접근 가능*/}
        <Route path="/" element={<Home />} />
        <Route path="/vehicles/:tokenId" element={<VehicleDetail />} />

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
