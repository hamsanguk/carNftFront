//서버요청 지연하는 코드,스켈레톤 ui 개발용
export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function withMinDuration<T>(p: Promise<T>, minMs = 800): Promise<T> {
  const [res] = await Promise.all([p, delay(minMs)]);
  return res as T;
}
