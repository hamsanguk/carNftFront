// src/utils/roles.ts
export const ROLE_MAP: Record<string, 'admin' | 'workshop' | 'user'> = {
  '0x569585b441e57297f2dfa18530b6249d7ba9dc98': 'admin',
  '0x17f61e2979446b9032Fec23cCC7082B37789C2a0': 'workshop',
  '0x4FF2fdDF58d71D47292e97FF6037BD9a83b9932a': 'user',
};
export const getRoleByAddress = (address: string): 'admin' | 'workshop' | 'user' | 'guest' => {
  if (!address) return 'guest';
  return ROLE_MAP[address.toLowerCase()] || 'user';
};

