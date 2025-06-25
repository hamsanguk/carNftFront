import { ethers } from 'ethers';
import AccessControlABI from '../abi/AccessControlManager.json';

const CA = process.env.REACT_APP_ACCESS_CONTROL_CA;
const WORKSHOP_ROLE = ethers.keccak256(ethers.toUtf8Bytes('WORKSHOP_ROLE'));
const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes('ADMIN_ROLE'));

export const getAccessControlContract = (providerOrSigner: ethers.Provider | ethers.Signer) => {
  if (!CA) throw new Error('AccessControl contract address not set');
  return new ethers.Contract(CA, AccessControlABI.abi, providerOrSigner);
};

export const checkRole = async (
  provider: ethers.Provider,
  address: string
): Promise<'admin' | 'workshop' | 'user'> => {
  const contract = getAccessControlContract(provider);
  const isAdmin = await contract.hasRole(ADMIN_ROLE, address);
  if (isAdmin) return 'admin';
  const isWorkshop = await contract.hasRole(WORKSHOP_ROLE, address);
  if (isWorkshop) return 'workshop';
  return 'user';
};
