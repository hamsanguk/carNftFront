import { ethers, BrowserProvider, Contract } from 'ethers';
import historyManagerAbi from '../abi/HistoryManager.json'

const HISTORY_MANAGER_ADDRESS = process.env.REACT_APP_HISTORY_MANAGER_ADDRESS!;
if (!HISTORY_MANAGER_ADDRESS) {
  throw new Error('HISTORY_MANAGER_ADDRESS env 설정오류');
};

export function getHistoryManagerContract(
  providerOrSigner: ethers.BrowserProvider | ethers.Signer
): ethers.Contract {
  return new ethers.Contract(
    HISTORY_MANAGER_ADDRESS,
    historyManagerAbi,
    providerOrSigner,
  );
}

// 이력 추가 함수
export async function addHistory(
  provider: ethers.BrowserProvider,
  tokenId: number,
  category: 'maintenance' | 'accident',
  cid: string,
): Promise<void> {
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const contract = getHistoryManagerContract(signer);
  const tx = await contract.addHistory(tokenId, category, cid);
  await tx.wait();
}

// 이력 조회 함수
export async function getHistories(
  provider: ethers.BrowserProvider,
  tokenId: number,
): Promise<string[]> {
  const contract = getHistoryManagerContract(provider);
  return await contract.getHistories(tokenId);
}
