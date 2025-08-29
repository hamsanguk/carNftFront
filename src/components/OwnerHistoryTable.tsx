import React from 'react';
import styles from './css/OwnerHistoryTable.module.css'

interface OwnerHistory {
  ownerAddress: string;
  startTimestamp: number; // 초 단위(권장)
  endTimestamp: number | null; // 초 단위(권장)
}

interface Props {
  histories: OwnerHistory[];
  myAddress?: string; // 소문자 전달 권장
}

function toSeconds(ts: number | null) {
  if (ts == null) return null;
  // 밀리초로 들어오면 1e12 이상일 확률이 높음 → 초로 변환
  return ts > 1e12 ? Math.floor(ts / 1000) : ts;
}

function formatDate(ts: number | null) {
  if (ts == null) return '현재';
  const s = toSeconds(ts)!;
  const d = new Date(s * 1000);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}.${mm}.${dd}`;
}

const OwnerHistoryTable: React.FC<Props> = ({ histories, myAddress }) => {
  if (!histories.length)
    return <p>소유주 이력이 없습니다. (민팅이 안 된 토큰이거나 인덱싱 필요)</p>;

  // 정렬: 과거→현재 (원하면 .reverse()로 최신→과거)
  const sorted = [...histories].sort(
    (a, b) => toSeconds(a.startTimestamp)! - toSeconds(b.startTimestamp)!
  );

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>순번</th>
          <th>소유주</th>
          <th>보유기간</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((h, i) => {
          const addrLower = h.ownerAddress.toLowerCase();
          const highlight = myAddress && addrLower === myAddress;
          return (
            <tr
              key={`${addrLower}-${toSeconds(h.startTimestamp) ?? '0'}`}
              style={{ background: highlight ? '#ffeebb' : undefined }}
            >
              <td>{i + 1}</td>
              <td style={{ fontFamily: 'monospace' }}>
                {h.ownerAddress.slice(0, 6)}...{h.ownerAddress.slice(-4)}
                {highlight && ' (me)'}
              </td>
              <td>
                {formatDate(h.startTimestamp)} ~ {formatDate(h.endTimestamp)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default OwnerHistoryTable;
