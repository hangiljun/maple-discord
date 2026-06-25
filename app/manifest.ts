import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '메이플디스코드 | 메이플스토리·메이플랜드·메이플플래닛 종합 디스코드',
    short_name: '메이플디스코드',
    description: '메이플스토리, 메이플랜드, 메이플플래닛 3개 게임 종합 디스코드. 5만 명 커뮤니티.',
    start_url: '/home',
    display: 'standalone',
    background_color: '#1e3a5f',
    theme_color: '#1e3a5f',
    icons: [
      {
        src: '/og-image-v3.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
    ],
  }
}
