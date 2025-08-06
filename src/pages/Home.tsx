// src/pages/Home.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/Footer';
import styles from './css/Home.module.css';
import VehicleCard from '../components/VehicleCard';
import SearchBanner from '../components/SearchBanner';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

type Vehicle = {
  tokenId: number;
  vin: string;
  manufacturer: string;
  ownerDb: string;
  ownerOnChain: string | null;
  mintedAt: string;
  tokenUri?: string | null;
  forSale: boolean;
};

type VehicleHistory = {
  tokenId: number;
  type: string;   
  workshop: string;
  timestamp: string;
};

const Home = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedTokenIds, setCompletedTokenIds] = useState<Set<number>>(new Set());
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter') || 'all';
  const [histories, setHistories] = useState<VehicleHistory[]>([]);
  const [vehicleWithHistoryCount, setVehicleWithHistoryCount] = useState(0);

  const KOREAN_BRANDS = ['Hyundai', 'Genesis', 'Kia'];

  const visibleVehicles = vehicles.filter(v => !completedTokenIds.has(v.tokenId));

  const historyTokenIds = new Set(histories.map(h => h.tokenId));
  const withHistory = visibleVehicles.filter(v => historyTokenIds.has(v.tokenId)).length;

  const totalNft = visibleVehicles.length;
  const waiting = vehicles.length - totalNft;

  const filteredVehicles = visibleVehicles.filter(v => {
    if (filter === 'korean') return KOREAN_BRANDS.includes(v.manufacturer);
    if (filter === 'imported') return !KOREAN_BRANDS.includes(v.manufacturer);
    return true;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesRes, tradesRes] = await Promise.all([
          axios.get(`${API_BASE}/vehicles`),
          axios.get(`${API_BASE}/trade/requests?status=completed`)
        ]);
  
        const vehicleList = vehiclesRes.data;
        setVehicles(vehicleList);
  
        const tokenSet = new Set<number>(
          tradesRes.data.map((req: any) => Number(req.token_id))
        );
        setCompletedTokenIds(tokenSet);
  
        // visibleVehicles 계산 후 history fetch
        const visible = vehicleList.filter(
          (v: Vehicle) => !tokenSet.has(v.tokenId)
        );
  
        const results = await Promise.all(
          visible.map(async (v: Vehicle) => {
            try {
              const res = await axios.get(`${API_BASE}/ownership-history/${v.tokenId}`);
              return Array.isArray(res.data) && res.data.length > 0;
            } catch (err) {
              console.error(err);
              return false;
            }
          })
        );
  
        setVehicleWithHistoryCount(results.filter(Boolean).length);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (axios.isAxiosError(error)) {
          alert(`data 로딩 실패: ${error.response?.status || ''}`);
        } else {
          alert('알 수 없는 오류 발생');
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  
  return (
    <>
   
      <div className={styles.wrap}>
        <div className={styles.homeWrap}>
          <div className={styles.banner}>
          </div>
          <div className={styles.contentWrap}>
            <div className={styles.search}>
              <SearchBanner
                totalNft={totalNft}
                withHistory={vehicleWithHistoryCount}
              />
            </div>
            <div className={`${styles.mainPage} nomal_frame`}>
              <h1>NFT소유 인증차량</h1>
              <div className={styles.vehicleList}>
                {loading ? (
                  <div>로딩 중...</div>
                ) : filteredVehicles.length === 0 ? (
                  <div>해당 조건의 차량이 없습니다.</div>
                ) : (
                  filteredVehicles.slice().reverse().map(v => (
                    <VehicleCard key={v.tokenId} {...v} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.sideStickyBanner}>
          <div className={styles.tImage}></div>
          <ul className={`${styles.bUi} nomal_frame`}>
            <li>보험료 조회</li>
            <li>대출한도 조회</li>
          </ul>
        </div>
      </div>
      <div className={styles.bottom_banner}></div>
    </>
  );
};

export default Home;
