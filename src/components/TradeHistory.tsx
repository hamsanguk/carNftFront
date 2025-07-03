import React, { useEffect, useState } from "react";
import axios from "axios";

type TradeHistoryProps = {
  tokenId: number;
}
type TradeHistoryItem = {
  id:number; tokenId:number;
  from:string; to:string;
  txHash:string; tradedAt:string | Date;
}

function TradeHistory({ tokenId }: TradeHistoryProps) {//백엔드 응답이 항상 배열이였으면 좋겠다
  const [history, setHistory] = useState<TradeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokenId) return;
    setLoading(true);
    axios.get(`/trade-history/${tokenId}`)
      .then(res => setHistory(res.data))
      .finally(() => setLoading(false));
  }, [tokenId]);

  if (loading) return <div>Loading...</div>;
  if (!history.length) return <div>거래 이력이 없습니다.</div>;

  return (
    <div>
      <h3>거래 이력 (tokenId: {tokenId})</h3>
      <table>
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>TxHash</th>
            <th>Traded At</th>
          </tr>
        </thead>
        <tbody>
          {history.map(row => (
            <tr key={row.id}>
              <td>{row.from}</td>
              <td>{row.to}</td>
              <td>
                <a href={`https://scope.klaytn.com/tx/${row.txHash}`} target="_blank" rel="noopener noreferrer">
                  {row.txHash.slice(0, 10)}...
                </a>
              </td>
              <td>{new Date(row.tradedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TradeHistory;
