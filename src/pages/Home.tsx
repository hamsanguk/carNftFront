// src/pages/Home.tsx
import React from 'react';
import VehicleCard from '../components/VehicleCard';

const mockVehicles = [
  {
    vin: 'KMHEC41DAD0123456',
    manufacturer: 'Hyundai',
    mileage: 78400,
    tokenId: 1,
  },
  {
    vin: 'JN8AS5MT8CW305678',
    manufacturer: 'Nissan',
    mileage: 102400,
    tokenId: 2,
  },
  {
    vin: 'WBA3A5C58CF123456',
    manufacturer: 'BMW',
    mileage: 43600,
    tokenId: 3,
  },
];

const Home = () => {
  return (
    <div style={{ padding: '1rem' }}>
      <h2>차량 목록</h2>
      {mockVehicles.map((v, idx) => (
        <VehicleCard key={idx} {...v} />
      ))}
    </div>
  );
};

export default Home;
