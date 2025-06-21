// src/utils/roles.ts
export const ROLE_MAP: Record<string, 'admin' | 'workshop' | 'user'> = {
  '0xeab0579b727ee8eaeb919b69ab438587398533e4': 'admin',
  '0x17f61e2979446b9032fec23ccc7082b37789c2a0': 'workshop',
  '0x4ff2fddf58d71d47292e97ff6037bd9a83b9932a': 'user',
  '0xa30c0769f261c0fb89af22d7e1f9c4d263b1d0f4':'user'
};
export const getRoleByAddress = (address: string): 'admin' | 'workshop' | 'user' | 'guest' => {
  if (!address) return 'guest';
  return ROLE_MAP[address.toLowerCase()] || 'user';
};

