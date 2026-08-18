// PRD 부록 A — WMO Weather Code 매핑
// group: 배경 씬 결정에 쓰이는 날씨 그룹
export const weatherCodes = {
  0: { label: '맑음', icon: '☀️', group: 'clear' },
  1: { label: '대체로 맑음', icon: '🌤️', group: 'clear' },
  2: { label: '부분적으로 흐림', icon: '⛅', group: 'cloudy' },
  3: { label: '흐림', icon: '☁️', group: 'cloudy' },
  45: { label: '안개', icon: '🌫️', group: 'fog' },
  48: { label: '상고대 안개', icon: '🌫️', group: 'fog' },
  51: { label: '약한 이슬비', icon: '🌦️', group: 'rain' },
  53: { label: '보통 이슬비', icon: '🌦️', group: 'rain' },
  55: { label: '강한 이슬비', icon: '🌧️', group: 'rain' },
  56: { label: '약한 어는 이슬비', icon: '🌧️', group: 'rain' },
  57: { label: '강한 어는 이슬비', icon: '🌧️', group: 'rain' },
  61: { label: '약한 비', icon: '🌦️', group: 'rain' },
  63: { label: '보통 비', icon: '🌧️', group: 'rain' },
  65: { label: '강한 비', icon: '🌧️', group: 'rain' },
  66: { label: '약한 어는 비', icon: '🌧️', group: 'rain' },
  67: { label: '강한 어는 비', icon: '🌧️', group: 'rain' },
  71: { label: '약한 눈', icon: '🌨️', group: 'snow' },
  73: { label: '보통 눈', icon: '🌨️', group: 'snow' },
  75: { label: '강한 눈', icon: '❄️', group: 'snow' },
  77: { label: '싸락눈', icon: '❄️', group: 'snow' },
  80: { label: '약한 소나기', icon: '🌦️', group: 'rain' },
  81: { label: '보통 소나기', icon: '🌧️', group: 'rain' },
  82: { label: '강한 소나기', icon: '🌧️', group: 'rain' },
  85: { label: '약한 소낙눈', icon: '🌨️', group: 'snow' },
  86: { label: '강한 소낙눈', icon: '❄️', group: 'snow' },
  95: { label: '뇌우', icon: '⛈️', group: 'storm' },
  96: { label: '약한 우박 동반 뇌우', icon: '⛈️', group: 'storm' },
  99: { label: '강한 우박 동반 뇌우', icon: '⛈️', group: 'storm' },
}

export function getWeatherInfo(code) {
  return weatherCodes[code] ?? { label: '알 수 없음', icon: '❓', group: 'cloudy' }
}
