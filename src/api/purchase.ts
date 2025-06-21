// src/api/purchase.ts
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface PurchaseRequest {
  tokenId: number;
  buyerAddress: string;
  date: string;
};

export const createPurchaseRequest = async (data: PurchaseRequest) => {
  return axios.post(`${API_BASE}/purchase-requests`, data);
};

export const getPurchaseRequests = async () => {
  return axios.get<PurchaseRequest[]>(`${API_BASE}/admin/purchase-requests`);
};
