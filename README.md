# Vehicle NFT 프로젝트

### 프로젝트 url:https://car-nft-front.vercel.app/

#### 프론트엔드 소스:https://github.com/hamsanguk/carNftFront
#### 백엔드 소스:https://github.com/hamsanguk/carNftBack
#### 스마트 컨트랙트 소스:https://github.com/hamsanguk/nft-car_contract


- 사이트 진입 최초에는 서버가 휴면 상태여서 응답시간이 깁니다.
- 처음 응답을 받고나면 이후 요청들은 대기시간이 짧아집니다.

## 프로젝트 개요

이 프로젝트는 기존 Web2 중고차 플랫폼의 **보조 인증 시스템**으로 설계된 하위 사이트입니다.  
차량의 VIN(차대번호) 정보를 기반으로 NFT(ERC-721)를 발행하고, 차량의 **정비/사고/주행 이력**을 블록체인과 탈중앙 저장소(IPFS)에 기록함으로써,  
**이전 소유주와 정비 이력의 위변조 방지 및 투명한 열람**을 가능하게 합니다.

- 실제 차량의 거래는 기존 방식(딜러, 계약 등)으로 진행됩니다.
- 본 프로젝트에서는 차량을 대표하는 ERC-721 NFT만 거래되며, 차량 거래 완료 후 해당 NFT가 새로운 소유자에게 양도됨으로써 소유권 이력이 연결됩니다.

## 프로젝트 주소 및 니모닉

>  일반적인 EVM 계열 주소로는 이 프로젝트의 기능 사용에 제약이 있습니다.

### 프로젝트 전용 메타마스크 니모닉
- 메타마스크의 설치가 완료되면 새 지갑 생성이 아닌 기존 지갑 가져오기를 클릭 이래의 니모닉을 입력해주세요.
- 위 니모닉을 메타마스크에서 복원하면 프로젝트 전용 지갑 주소들을 확인할 수 있습니다.
- 이 주소들은 이미 컨트랙트에 역할(Role)이 등록되어 있으며, 테스트 및 시연용으로 사용됩니다.

```
laundry trigger canyon page cart dentist raise journey maximum panel fault rubber
```

메타마스크 설치와 지갑을 불러왔다면, 네트워크을 변경해야 됩니다. 메타마스크를 최초 설치시에 기본값으로 네트워크를 이더리움을 바라보고 있습니다.
프로젝트에서는 kairos testnet으로 맞추어야 됩니다. 
이 url 에서 해당 네트워크를 찾아서 메타마스크에 추가해야 됩니다. https://chainlist.org/chain/1001   에서 connect wallet 클릭
프로젝트 home에서 메타마스크 로그인 버튼을 클릭하여 메타마스크 확장프로그램이 열리면 사이트의 로고를 클릭하여 사용중인 네트워크를 확인하고,
kairos testnet이 아니라면 맞추어야 됩니다.

## 역할(Role) 부여 방식

이 프로젝트는 **역할 기반 권한 제어(RBAC)**를 스마트 컨트랙트 레벨에서 적용합니다.

### 역할 부여 함수 (Owner만 호출 가능)

```
CA:0xAc22405d7208aC9c104B8B58765C3d4B48877D01
deployerAddress:0x4FF2fdDF58d71D47292e97FF6037BD9a83b9932a

function grantAdmin(address account) external onlyOwner
function grantWorkshop(address account) external onlyOwner
```

### 역할 설명 및 가능한 기능

| 역할 | 기능 설명 |
|------|-----------|
| **Admin** | - NFT 민팅 승인<br> - 사용자 역할 부여 및 회수<br> - 거래 요청 승인 |
| **Workshop** | - 차량 정비 이력 작성 및 업로드 (IPFS)<br> - 민팅 요청 등록 |
| **Owner (차주)** | - 자신의 차량 NFT 소유<br> - 차량 거래 요청 전송 |
| **기타 지갑 주소** | - 열람만 가능하며, 기능 사용은 제한됩니다. |

## 기술적 연결 구조

- 차량 NFT는 `tokenId`를 기준으로 고유하게 식별됩니다.
- 정비 이력은 JSON 형태로 IPFS(Pinata)에 업로드되며, 내부에 `tokenId`가 포함되어 연결됩니다.
- DB를 별도로 사용하지 않고, 프론트엔드에서 tokenId 기준으로 IPFS 메타데이터를 조회합니다.

NFT오픈마켓에서 나타날JSON 예시  (IPFS 업로드 내용):

```json
{
  "tokenId": 23,
  "type": "maintenance",
  "description": "브레이크 패드 교체",
  "workshop": "0x123...abc",
  "timestamp": 1692928472
}
```

## 주의사항

- 정비 이력은 위변조 방지를 위해 IPFS에만 저장되며 수정이 불가능합니다.
- 기능 테스트 제공된 니모닉 기반 지갑 주소를 사용을 권장합니다.
- 일반적인 주소로 접속 시 버튼이 비활성화되거나 기능이 제한될 수 있음

---

본 프로젝트는 Web3 기술을 기존 Web2 중고차 인증 시스템에 보조적으로 결합하여,  
보다 신뢰도 높은 차량 이력 검증 수단을 제공합니다.
