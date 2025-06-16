// src/components/VehicleHistoryTable.tsx
import React from 'react';

interface History {
  date: string;
  type: '정비' | '사고';
  description: string;
  workshop: string;
}

interface Props {
  histories: History[];
}

const VehicleHistoryTable: React.FC<Props> = ({ histories }) => {
  return (
    <table border={1} cellPadding={8} style={{ marginTop: '1rem', width: '100%' }}>
      <thead>
        <tr>
          <th>날짜</th>
          <th>유형</th>
          <th>설명</th>
          <th>정비소</th>
        </tr>
      </thead>
      <tbody>
        {histories.map((h, i) => (
          <tr key={i}>
            <td>{h.date}</td>
            <td>{h.type}</td>
            <td>{h.description}</td>
            <td>{h.workshop}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default VehicleHistoryTable;
