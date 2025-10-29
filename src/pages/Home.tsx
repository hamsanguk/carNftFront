// src/pages/Home.tsx
//skelletonUi 완료되면 서버요청 복구하기

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import VehicleCard from '../components/VehicleCard';
import SearchBanner from '../components/SearchBanner';
import { useWallet } from '../contexts/WalletContext';
import { withMinDuration } from '../utils/net';
import styles from './css/Home.module.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const PAGE_SIZE = 9;
const KOREAN_BRANDS = ['Hyundai', 'Genesis', 'Kia'];
const MIN_SKELETON_MS = Number(process.env.REACT_APP_MIN_SKELETON_MS ?? 0);

// ---------- Types ----------
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

// ---------- Skeleton ----------
function SkeletonGrid({ count }: { count: number }) {
  return (
    <div className={styles.vehicleList}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.skelCard} aria-hidden="true">
          <div className={styles.skelThumb} />
          <div className={styles.skelLine} />
          <div className={styles.skelLineShort} />
        </div>
      ))}
    </div>
  );
}

const Home = () => {
  // wallet
  const { account, connected, connectWallet, disconnectWallet } = useWallet();

  // ui state
  const [isPolicyOpen, setPolicyOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get('filter') || 'all';

  // data state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [completedTokenIds, setCompletedTokenIds] = useState<Set<number>>(new Set());
  const [vehicleWithHistoryCount, setVehicleWithHistoryCount] = useState(0);

  // loading + error
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // pagination
  const initialPage = Math.max(1, Number(searchParams.get('page') || 1));
  const [page, setPage] = useState<number>(initialPage);

  // ---------- Effects: modal esc/scroll lock ----------
  useEffect(() => {
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
  }, [isPolicyOpen]);

  // ---------- Fetch ----------
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    const job = (async () => {
      // 콜드스타트 깨우기(있으면 사용)
      try {
        await axios.get(`${API_BASE}/health`, { timeout: 5000 });
      } catch {
        // health 엔드포인트가 없거나 실패해도 무시하고 본요청 진행
      }

      const [vehiclesRes, tradesRes] = await Promise.all([
        axios.get(`${API_BASE}/vehicles`),
        axios.get(`${API_BASE}/trade/requests?status=completed`),
      ]);

      const vehicleList: Vehicle[] = vehiclesRes.data;
      setVehicles(vehicleList);

      const tokenSet = new Set<number>(tradesRes.data.map((req: any) => Number(req.token_id)));
      setCompletedTokenIds(tokenSet);

      // 히스토리 존재 여부 카운트(표시용)
      const visible = vehicleList.filter((v) => !tokenSet.has(v.tokenId));
      const results = await Promise.all(
        visible.map(async (v: Vehicle) => {
          try {
            const res = await axios.get(`${API_BASE}/ownership-history/${v.tokenId}`);
            return Array.isArray(res.data) && res.data.length > 0;
          } catch {
            return false;
          }
        })
      );
      setVehicleWithHistoryCount(results.filter(Boolean).length);
    })();

    try {
      await withMinDuration(job, MIN_SKELETON_MS);
    } catch {
      setErrorMsg('데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------- Derived ----------
  const visibleVehicles = useMemo(
    () => vehicles.filter((v) => !completedTokenIds.has(v.tokenId)),
    [vehicles, completedTokenIds]
  );

  const filteredVehicles = useMemo(() => {
    if (filter === 'korean') return visibleVehicles.filter((v) => KOREAN_BRANDS.includes(v.manufacturer));
    if (filter === 'imported') return visibleVehicles.filter((v) => !KOREAN_BRANDS.includes(v.manufacturer));
    return visibleVehicles;
  }, [visibleVehicles, filter]);

  const sorted = useMemo(() => filteredVehicles.slice().reverse(), [filteredVehicles]); // 최신 우선
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = useMemo(() => Math.min(page, totalPages), [page, totalPages]);

  const pagedVehicles = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, currentPage]);

  // 배너/카운트용
  const totalNft = visibleVehicles.length;

  // 필터 바뀌면 페이지 1로
  useEffect(() => {
    setPage(1);
  }, [filter]);

  // URL 쿼리 반영
  useEffect(() => {
    const params: Record<string, string> = {};
    if (filter && filter !== 'all') params.filter = filter;
    if (currentPage > 1) params.page = String(currentPage);
    setSearchParams(params, { replace: true });
  }, [filter, currentPage, setSearchParams]);

  // 페이지 범위 보정
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  return (
    <>
      <div className={styles.wrap}>
        <div className={styles.homeWrap}>
          {/* 상단 배너 */}
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

          {/* 콘텐츠 */}
          <div className={styles.contentWrap}>
            <div className={styles.search}>
              <SearchBanner totalNft={totalNft} withHistory={vehicleWithHistoryCount} />
            </div>

            <div className={`${styles.mainPage} nomal_frame`}>
              <div className={styles.mainHeader}>
                <h1>NFT소유 인증차량</h1>
              </div>

              {/* 리스트 영역 */}
              {errorMsg ? (
                <div className={styles.errorBox}>
                  {errorMsg}{' '}
                  <button type="button" onClick={fetchData} className={styles.linkBtn}>
                    다시 시도
                  </button>
                </div>
              ) : loading ? (
                <SkeletonGrid count={PAGE_SIZE} />
              ) : sorted.length === 0 ? (
                <div>해당 조건의 차량이 없습니다.</div>
              ) : (
                <>
                  <div className={styles.vehicleList}>
                    {pagedVehicles.map((v) => (
                      <VehicleCard key={v.tokenId} {...v} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <nav className={styles.pagination} role="navigation" aria-label="Pagination">
                      <div className={styles.pageButtons}>
                        {Array.from({ length: totalPages }, (_, i) => {
                          const p = i + 1;
                          const isActive = p === currentPage;
                          return (
                            <button
                              key={p}
                              type="button"
                              className={`${styles.bullet} ${isActive ? styles.bulletActive : ''}`}
                              aria-label={`페이지 ${p}`}
                              aria-current={isActive ? 'page' : undefined}
                              onClick={() => setPage(p)}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* 사이드 배너 */}
        <div className={styles.sideStickyBanner}>
          <div className={styles.tImage}></div>
          <ul className={`${styles.bUi} nomal_frame`}>
            <li>보험료 조회</li>
            <li>대출한도 조회</li>
          </ul>
        </div>
      </div>

      {/* 하단 배너 */}
      <div className={styles.bottom_banner}></div>
      <div className={styles.bottom_left_banner}></div>

      {/* 면책 모달 */}
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
            onClick={(e) => e.stopPropagation()}
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
