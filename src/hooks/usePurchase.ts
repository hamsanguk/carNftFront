// src/hooks/usePurchase.ts
import { useState, useEffect } from 'react';
import {
  createPurchaseRequest,
  getPurchaseRequests,
  PurchaseRequest,
} from '../api/purchase';

export const usePurchase = () => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);

  const addRequest = async (request: PurchaseRequest) => {
    await createPurchaseRequest(request);
    setRequests([...requests, request]); // 로컬 반영 (선택적)
  };

  const fetchRequests = async () => {
    const res = await getPurchaseRequests();
    setRequests(res.data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return { requests, addRequest, fetchRequests };
};
