import { Contract, Provider, Signer } from 'ethers';
import VehicleNFTAbi from '../abi/VehicleNFT.json';

const CA = process.env.REACT_APP_VEHICLE_NFT_ADDRESS;

/**
 * VehicleNFT 컨트랙트를 얻어옵니다.
 * @param providerOrSigner ethers Provider 또는 Signer
 */
export const getVehicleNFTContract = (
  providerOrSigner: Provider | Signer
): Contract => {
  if (!CA) {
    throw new Error('VehicleNFT contract address not set');
  }
  return new Contract(CA, VehicleNFTAbi, providerOrSigner);
};

/**
 * 주어진 주소의 역할을 확인합니다.
 * - admins 매핑을 먼저 확인
 * - workshops 매핑을 그다음 확인
 * - 둘 다 아니면 'user'
 */
export const checkRole = async (
  provider: Provider,
  address: string
): Promise<'admin' | 'workshop' | 'user'> => {
  const contract = getVehicleNFTContract(provider);
  const isAdmin: boolean = await contract.admins(address);
  if (isAdmin) return 'admin';
  const isWorkshop: boolean = await contract.workshops(address);
  if (isWorkshop) return 'workshop';
  return 'user';
};
