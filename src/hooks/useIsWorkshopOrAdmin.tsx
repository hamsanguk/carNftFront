// src/hooks/useIsWorkshopOrAdmin.ts
import { useEffect, useState } from 'react';
import { Contract, BrowserProvider } from 'ethers';
import vehicleNftAbi from '../abi/VehicleNFT.json'

const VEHICLE_NFT_ADDRESS = process.env.REACT_APP_VEHICLE_NFT_CA!;


export function useIsWorkshopOrAdmin(
  provider: BrowserProvider | null,
  account: string | undefined | null
) {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!provider || !account) {
      setIsAllowed(null);
      return;
    }
    const check = async () => {
      const contract = new Contract(VEHICLE_NFT_ADDRESS, vehicleNftAbi, provider);
      const isWorkshop = await contract.workshops(account);
      const isAdmin = await contract.admins(account);
      setIsAllowed(isWorkshop || isAdmin);
    };
    check();
  }, [provider, account]);

  return isAllowed;
}
