import axios from 'axios';
import { SyntaxKind } from 'typescript';

// 환경변수로 베이스 URL 설정 (예: REACT_APP_API_URL)
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
});

export interface Vehicle {
  tokenId: number;
  vin: string;
  manufacturer: string;
  ownerDb: string;
  ownerOnChain: string;
  mintedAt: string;
  tokenUri?: string;
}

/**
 * VIN 기반 NFT 민팅 요청
 * @param vin 차량 식별번호
 * @param manufacturer 제조사
 * @param ownerAddress 소유자 지갑 주소
 */
export async function mintVehicle(
  vin: string,
  manufacturer: string,
  ownerAddress: string,
  workshopAddress: string,
  metadataUri:string,
): Promise<Vehicle> {
  const response = await API.post(//이 구조가 postman test용 구조가 아닌지 확인
    '/vehicles/mint',
    { vin, manufacturer, metadataUri },
    { headers: { 'x-owner-address': ownerAddress, 'x-workshop-address': workshopAddress,} },
  );
  return response.data.vehicle;
}

/**
 * 토큰ID로 NFT 정보 조회
 * @param tokenId 조회할 토큰 ID
 */
export async function getVehicle(
  tokenId: number
): Promise<Vehicle> {
  const response = await API.get<Vehicle>(`/nft/${tokenId}`);
  return response.data;
}