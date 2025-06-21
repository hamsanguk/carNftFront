// src/contexts/PurchaseContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PurchaseRequest {
  tokenId: number;
  buyerAddress: string;
  date: string;
}

interface PurchaseContextType {
  requests: PurchaseRequest[];
  addRequest: (r: PurchaseRequest) => void;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

export const PurchaseProvider = ({ children }: { children: ReactNode }) => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);

  const addRequest = (r: PurchaseRequest) => {
    setRequests((prev) => [...prev, r]);
  };

  return (
    <PurchaseContext.Provider value={{ requests, addRequest }}>
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchase = () => {
  const ctx = useContext(PurchaseContext);
  if (!ctx) throw new Error('usePurchase must be used inside PurchaseProvider');
  return ctx;
};
