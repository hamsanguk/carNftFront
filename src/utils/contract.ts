import { ethers } from 'ethers';
import VehicleNFTABI from '../abi/VehicleNFT.json';

const CA = process.env.REACT_APP_VEHICLE_NFT_CA;

export const getVehicleNFTContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  if (!CA) throw new Error('Contract address not defined');
  return new ethers.Contract(CA, VehicleNFTABI.abi, signerOrProvider);
};
