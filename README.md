# Terra Weather

지구본을 돌려 랜드마크를 찍으면, 그곳의 날씨와 시간 속으로 화면이 바뀌는 날씨 사이트.
`PRD_3D_Globe_Weather.md`의 핵심 MVP 범위를 구현한 결과물입니다.

## 실행

```bash
npm install
npm run dev
```

## 구현 범위

- 3D 지구본 + 랜드마크 12곳 핀 (클릭 시 카메라 플라이투)
- 실시간 날씨 · 현지 시각 상세 패널 (Open-Meteo, API 키 불필요)
- 시간대 × 날씨에 따른 배경 크로스페이드 연출
- 도시/랜드마크 검색 (자동완성)
- 로딩 화면, 오프라인/에러 처리, WebGL 미지원 폴백

필터, 리스트 뷰, 즐겨찾기, 딥링크, 사운드 등은 이번 범위에서 제외했습니다 (자세한 내용은 PRD 및 계획 문서 참고).

Weather data by [Open-Meteo.com](https://open-meteo.com) (CC BY 4.0)
