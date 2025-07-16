import axios from 'axios';

// 환경변수에서 Pinata 인증정보를 읽어옵니다
const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY!;
const PINATA_SECRET_API_KEY = process.env.REACT_APP_PINATA_SECRET_API_KEY!;

// Pinata 이미지 업로드 (선택)
export async function uploadImageToIPFS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
    maxBodyLength: Infinity,
    headers: {
      'Content-Type': 'multipart/form-data',
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
  });

  return res.data.IpfsHash as string;
}

// 차량 이력 메타데이터 업로드 (이미지 CID 포함)
export interface VehicleHistoryInput {
  tokenId: number;
  category: 'maintenance' | 'accident';
  date: string;
  description: string;
  imageFile?: File;
}

export async function uploadHistoryMetadata(input: VehicleHistoryInput): Promise<string> {
  let imageCid: string | undefined;

  if (input.imageFile) {
    imageCid = await uploadImageToIPFS(input.imageFile);
  }

  const metadata = {
    tokenId: input.tokenId,
    category: input.category,
    date: input.date,
    description: input.description,
    imageCid,
  };

  const res = await axios.post(
    'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    metadata,
    {
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    }
  );

  return res.data.IpfsHash as string; // 이게 최종 CID
}
