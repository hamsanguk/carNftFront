import React from 'react';
import styles from './css/OwnerHistoryTable.module.css'

interface OwnerHistory {
  ownerAddress: string;
  startTimestamp: number;
  endTimestamp: number | null;
}

interface Props {
  histories: OwnerHistory[];
  myAddress?: string; // 내 주소(선택: 하이라이트)
}

function formatDate(ts: number | null) {
  if (!ts) return '현재';
  const d = new Date(Number(ts) * 1000);
  return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d
    .getDate()
    .toString()
    .padStart(2, '0')}`;
}

const OwnerHistoryTable: React.FC<Props> = ({ histories, myAddress }) => {
  if (!histories.length)
    return <p>소유주 이력이 없습니다. (민팅이 안 된 토큰이거나 인덱싱 필요)</p>;

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
        {histories.map((h, i) => (
          <tr
            key={i}
            style={{
              background:
                myAddress &&
                h.ownerAddress.toLowerCase() === myAddress.toLowerCase()
                    ? '#ffeebb'
                    : undefined,
            }}
          >
            <td>{i + 1}</td>
            <td style={{ fontFamily: 'monospace' }}>
              {h.ownerAddress.slice(0, 6)}...{h.ownerAddress.slice(-4)}
              {myAddress &&
                h.ownerAddress.toLowerCase() === myAddress.toLowerCase() &&
                '(me)'}
            </td>
            <td>
              {formatDate(h.startTimestamp)} ~ {formatDate(h.endTimestamp)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OwnerHistoryTable;
