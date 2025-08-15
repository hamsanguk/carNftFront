// src/pages/Home.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import VehicleCard from '../components/VehicleCard';
import SearchBanner from '../components/SearchBanner';
import { useWallet } from '../contexts/WalletContext';
import styles from './css/Home.module.css'

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
  const [isPolicyOpen, setPolicyOpen] = useState(false);
  const [completedTokenIds, setCompletedTokenIds] = useState<Set<number>>(new Set());
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter') || 'all';
  const [histories, setHistories] = useState<VehicleHistory[]>([]);
  const {account, connected, connectWallet, disconnectWallet} = useWallet();
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

  useEffect(()=>{
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPolicyOpen(false);
    };
    if (isPolicyOpen) {
      document.addEventListener('keydown', onKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = 'auto';
    };
  },[isPolicyOpen]);

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
            <div className={styles.bannerImage}></div>
            <div className={`${styles.login} nomal_frame`}>
            <button
              className={styles.loginbutton}
              onClick={connected ? disconnectWallet : connectWallet}
            >
              {connected && account ? '연결 해제하기' : '메타마스크 로그인'}
            </button>
                <ul>
                <li
                    className={styles.info}
                    onClick={() => setPolicyOpen(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setPolicyOpen(true)}
                  >
                    정책 / 지침 보기
                  </li>
                  <li>회원가입</li>
                </ul>
            </div>
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
      <div className={styles.bottom_left_banner}></div>
      {isPolicyOpen && (
  <div
    className={styles.modalOverlay}
    onClick={() => setPolicyOpen(false)}
    aria-hidden="true"
  >
    <div
      className={styles.modal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="policyTitle"
      onClick={(e) => e.stopPropagation()} // 내부 클릭 시 전파 중단
    >
      <h2 id="policyTitle" className={styles.modalTitle}>면책 고지</h2>
      <div className={styles.modalBody}>
        <p>
          NFT는 개인키 보유자에 의해 지갑 간 직접 전송·거래가 가능합니다. 다만 본 서비스가 안내하는 감독 절차
          (거래 요청 → 승인 → 컨트랙트 실행)를 거치지 않고 이루어진 직접 전송은 서비스 범위를 벗어난 거래로 간주되며,
          이로 인한 손실·분쟁에 대해서는 지원 또는 책임을 지기 어렵습니다. 안전한 이용을 위해 반드시 서비스 내 절차를 따르십시오.
        </p>
        <p>
          또한 메타마스크 및 기타 지갑/게이트웨이/RPC 등 외부 서비스의 장애·정책 변경으로 인한 영향에 대해 당사는 책임을 지지 않습니다.
        </p>
      </div>
    </div>
  </div>
)}
    </>
  );
};
export default Home;
{/*
  home에 사이트 최초진입시 엔카에서 nft등록이 된 차량을 보고 링크를 통해 사용자가 프로젝트에 진입했을 것을 가정하여 상황을 설명하는 모달 만들기*
    #d72e36

home.tsx에 팝업으로는 사이트를 소개하는 글
면책조항은 홈에 넣고, vehicleDetail이 휑한데 거기에도 바탕과 비슷한 명도(회색)으로 하단에 적기


[면책 조항:NFT는 개인키 보유자에 의해 지갑 간 직접 전송·거래가 가능합니다. 다만 본 서비스가 안내하는 감독 절차(거래 요청 → 승인 → 컨트랙트 실행 )
를 거치지 않고 이루어진 직접 전송은 서비스 범위를 벗어난 거래로 간주되며, 이로 인한 손실·분쟁에 대해서는 지원 또는 책임을 지기 어렵습니다. 
안전한 이용을 위해 반드시 서비스 내 절차를 따라 주십시오.
메타마스크 및 기타 지갑/게이트웨이/RPC 등 외부 서비스의 장애·정책 변경으로 인한 영향에 대해 당사는 책임을 지지 않습니다.
]

  [엔카와의 관계설명:해당 사이트에서 진행되는 거래는 법적으로 정상적으로 진행되는 거래 도중, 거래 완료 후에 진행해주세요,]

[사이트 안내: 본 NFt는 자동차 소유권,등록증,담보권등의 법적 권리를 데체할 수 없으며, 변조없는 무결성을 보장 할 디지털 증표입니다
]

    사이트 상단 메인배너 쪼게서 로그인 Ui 빨간색으로 구현하기
     차량 토큰이 많아졌을때를 대비해서 한 페이지에는 16개만 표시하기
    이용하는 입장에서 판매를 원할때는 어떻게?: 계정으로 민팅을 하고 받고 나서
    그러면 자동으로 매물이 등록되지 (차량이 거래가 이루어진 이후 차량을 목록에서 내릴 수 가 있어야 되고
    이런 관리는 어드민이)
    프로젝트에 사진을 넣지 않은 이유는 프로젝트의 각 nft는 엔카 사이트의 nft등록 차량이라고 메인사이트에 표시가
    되어있다. 프로젝트에 있는 nft는 가상의 차량으로 
    엔카와연결되어 있다는 의미로 detailpage에 엔카에서 보기 ui 링크만표시 alert로 "엔카로 이동합니다"라고 명시만
    */}
