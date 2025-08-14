// src/components/MintVehicleForm.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { mintVehicle } from '../api/api';
import { useWallet } from '../contexts/WalletContext';
import Workshop from '../pages/Workshop';

const DEFAULT_ATTRS = {
  vin: '',
  manufacturer: '',
  model: '',
  year: '',
  car_shape: '',
  fuel_type: '',
  origin_color: '',
  displacement: '',
};

interface MintVehicleFormProps {
  ownerAddress: string;
  workshopAddress?: string;
  approved?: boolean;
  allowedVins?: string[];
  onMintSuccess?: (vehicle: any) => void;
}

const MintVehicleForm: React.FC<MintVehicleFormProps> = ({
  ownerAddress,
  workshopAddress: workshopProp,
  approved = true,
  allowedVins,
  onMintSuccess,
}) => {
  const [attr, setAttr] = useState(DEFAULT_ATTRS);
  const [to, setTo] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { account } = useWallet();

  // normalize workshop address
  const workshop = (workshopProp || account || '').toLowerCase().trim();

  // handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setAttr({ ...attr, [e.target.name]: e.target.value });

  // optional image upload
  const handleImageUpload = async () => {
    if (!imageFile) return undefined;
    const formData = new FormData();
    formData.append('file', imageFile);
    const res = await axios.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.ipfsUri;
  };

  // upload metadata
  const handleMetadataUpload = async (imageUri?: string) => {
    const attributes = [
      { trait_type: 'VIN', value: attr.vin },
      { trait_type: 'Manufacturer', value: attr.manufacturer },
      { trait_type: 'Model', value: attr.model },
      { trait_type: 'Year', value: attr.year },
      { trait_type: 'Car_shape', value: attr.car_shape },
      { trait_type: 'Fuel_Type', value: attr.fuel_type },
      { trait_type: 'Origin_Color', value: attr.origin_color },
      { trait_type: 'Displacement', value: attr.displacement },
    ];
    const metadata = {
      name: attr.model,
      description: `${attr.year} ${attr.manufacturer} ${attr.model}`,
      ...(imageUri && { image: imageUri }),
      attributes,
    };
    const { metadataUri } = await axios
      .post('/vehicle/metadata', metadata)
      .then(r => r.data);
    return metadataUri;
  };

  const handleMint = async () => {
    if (!approved) {
      return setError('아직 관리자 승인이 필요합니다.');
    }
    if (!attr.vin.trim() || !attr.manufacturer.trim()) {
      return setError('VIN과 제조사는 필수입니다.');
    }
    if (!to.trim()) {
      return setError('소유자 지갑 주소(to)를 입력하세요.');
    }
    if (allowedVins && !allowedVins.includes(attr.vin.trim())) {
      return setError('승인된 VIN만 민팅할 수 있습니다.');
    }

    setLoading(true);
    setError(null);

    try {
      // 1) optional image
      const imageUri = imageFile ? await handleImageUpload() : undefined;
      // 2) metadata
      const metadataUri = await handleMetadataUpload(imageUri);
      // 3) call API with all four args
      const vehicle = await mintVehicle(
        attr.vin.trim(),
        attr.manufacturer.trim(),
        to.toLowerCase().trim(),
        workshop,
        metadataUri
      );
      onMintSuccess?.(vehicle);

      // reset form
      setAttr(DEFAULT_ATTRS);
      setImageFile(null);
      setTo('');
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || '민팅 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        name="vin"
        placeholder="VIN"
        value={attr.vin}
        onChange={handleChange}
        disabled={loading || !approved}
      />
      <br />
      <input
        name="manufacturer"
        placeholder="Manufacturer"
        value={attr.manufacturer}
        onChange={handleChange}
        disabled={loading || !approved}
      />
      <br />
      <input
        name="model"
        placeholder="Model"
        value={attr.model}
        onChange={handleChange}
        disabled={loading || !approved}
      />
      <br />
      <input
        name="year"
        placeholder="Year"
        value={attr.year}
        onChange={handleChange}
        disabled={loading || !approved}
      />
      <br />
      <input
        name="car_shape"
        placeholder="Car Shape"
        value={attr.car_shape}
        onChange={handleChange}
        disabled={loading || !approved}
      />
      <br />
      <input
        name="fuel_type"
        placeholder="Fuel Type"
        value={attr.fuel_type}
        onChange={handleChange}
        disabled={loading || !approved}
      />
      <br />
      <input
        name="origin_color"
        placeholder="Origin Color"
        value={attr.origin_color}
        onChange={handleChange}
        disabled={loading || !approved}
      />
      <br />
      <input
        name="displacement"
        placeholder="Displacement"
        value={attr.displacement}
        onChange={handleChange}
        disabled={loading || !approved}
      />
      <br />

      <input
        name="to"
        placeholder="소유자 지갑주소 (to)"
        value={to}
        onChange={e => setTo(e.target.value)}
        disabled={loading || !approved}
      />
      <br />

      <input
        type="file"
        accept="image/*"
        onChange={e => setImageFile(e.target.files?.[0] ?? null)}
        disabled={loading || !approved}
      />
      <br />

      <button
        onClick={handleMint}
        disabled={loading || !approved}
        style={{ marginTop: 8 }}
      >
        {loading ? '민팅 중...' : '민팅'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!approved && (
        <div style={{ color: 'orange' }}>관리자 승인 후 민팅 가능</div>
      )}
    </div>
  );
};

export default MintVehicleForm;
// 프리픽스를 쓰고있다면, /api/...으로 호출 권장
