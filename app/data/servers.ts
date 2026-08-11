import type { Metadata } from 'next';

export type Channel = { name: string; desc: string };
export type FaqItem = { q: string; a: string };
export type ServerKey = 'maplestory' | 'mapleland' | 'mapleplanet';

export type ServerData = {
  key: ServerKey; path: string; emoji: string; eng: string; name: string; sub: string;
  aboutHead: string; about: string[];
  feature: { name: string; desc: string; worlds?: string };
  channels: Channel[]; faq: FaqItem[]; finalHead: string;
  discordUrl: string; breadcrumbName: string;
  meta: { title: string; description: string };
};

const BASE = 'https://www.maplediscord.com';

export const maplestory: ServerData = {
  key: 'maplestory', path: '/maplestory', emoji: '🍁', eng: 'MapleStory',
  name: '메이플스토리 디스코드',
  sub: '월드별 거래방부터 보스 대행·작업 의뢰까지, 한 곳에서.',
  aboutHead: '내 월드 매물만, 섞이지 않게.',
  about: [
    '메이플스토리 디스코드 거래방은 챌린저스·루나·스카니아·엘리시움·크로아·베라·오로라·에오스·헬리오스·메이플M까지 월드별 전용 채널로 나뉩니다. 내가 플레이하는 월드의 매물만 모아 보여주기 때문에, 다른 월드 글에 섞이지 않고 메소·아이템 거래 상대를 빠르게 찾을 수 있습니다.',
    '거래뿐 아니라 보스 대행, 부주 작업, 메포·캐시, 인기도작, 커미션까지 전문 작업 채널을 갖춰 필요한 작업을 바로 의뢰하고 견적받을 수 있습니다. 본서버 인증을 마친 유저만 참여해 안전한 거래 환경을 유지합니다.',
  ],
  feature: { name: '월드별 거래방', desc: '10개 월드 전용 채널에서 내 월드 매물만 보고 빠르게 거래합니다.',
    worlds: '챌린저스 · 루나 · 스카니아 · 엘리시움 · 크로아 · 베라 · 오로라 · 에오스 · 헬리오스 · 메이플M' },
  channels: [
    { name: '작업·대행', desc: '보스 대행, 부주 작업, 메포·캐시, 인기도작, 커미션' },
    { name: '커뮤니티', desc: '자유대화, 이벤트, 패치노트, 닉변요청, 화면공유' },
    { name: '안전 거래', desc: '본서버 인증 유저만 참여, 신고문의 채널 운영' },
  ],
  faq: [
    { q: '입장은 무료인가요?', a: '네, 디스코드 초대 링크로 누구나 무료로 입장할 수 있습니다.' },
    { q: '어느 월드나 거래할 수 있나요?', a: '10개 월드별 전용 채널이 있어, 내 월드 채널에서 바로 거래하면 됩니다.' },
    { q: '사기가 걱정돼요.', a: '본서버 인증을 마친 유저만 참여하며, 신고문의 채널로 문제 거래를 접수할 수 있습니다.' },
    { q: '보스 대행도 구할 수 있나요?', a: '작업·대행 채널에서 보스 대행·커미션을 의뢰하고 견적받을 수 있습니다.' },
  ],
  finalHead: '메이플스토리 디스코드,\n지금 입장하세요.',
  discordUrl: 'https://discord.gg/2UwBw8dnSv',
  breadcrumbName: '메이플스토리 디스코드',
  meta: {
    title: '메이플스토리 디스코드 거래방·커뮤니티',
    description: '메이플스토리 디스코드 거래방. 챌린저스·루나·스카니아 등 월드별 메소·아이템 거래, 보스 대행, 작업 의뢰를 한 곳에서. 본서버 인증으로 안전하게 거래하세요.',
  },
};

export const mapleland: ServerData = {
  key: 'mapleland', path: '/mapleland', emoji: '🌿', eng: 'MapleLand',
  name: '메이플랜드 디스코드',
  sub: '클래식 메랜 거래와 파티 모집을, 한 채널에서.',
  aboutHead: '빅뱅 전 구버전 감성, 그대로.',
  about: [
    '메이플랜드 디스코드는 빅뱅 전 구버전 메이플스토리를 즐기는 메랜 유저를 위한 거래방과 파티 모집을 중심으로 운영됩니다. 클래식 서버의 메소·아이템을 유저끼리 직접 거래하고, 파티 모집 채널에서 사냥·보스 파티원을 바로 구할 수 있습니다.',
    '공지사항·자유대화·가이드·닉변요청까지 통합 채널에서 메랜 정보를 한눈에 확인하고, 인증·신고문의 시스템으로 거래 사기를 예방합니다.',
  ],
  feature: { name: '메랜 거래방', desc: '클래식 서버의 메소·아이템을 유저끼리 직접 거래하는 전용 채널입니다.' },
  channels: [
    { name: '파티 모집', desc: '사냥·보스 파티, 파티원 구인을 바로 매칭' },
    { name: '통합 커뮤니티', desc: '공지사항, 자유대화, 가이드, 닉변요청' },
    { name: '안전 거래', desc: '인증·신고문의 시스템으로 사기 예방' },
  ],
  faq: [
    { q: '메이플랜드가 뭔가요?', a: '빅뱅 전 구버전 메이플스토리를 즐기는 클래식 서버입니다.' },
    { q: '거래는 어떻게 하나요?', a: '메랜 거래방 채널에서 메소·아이템을 유저끼리 직거래합니다.' },
    { q: '파티도 구할 수 있나요?', a: '파티 모집 채널에서 사냥·보스 파티원을 구할 수 있습니다.' },
    { q: '사기 예방은 어떻게 하나요?', a: '인증·신고문의 시스템으로 문제 거래를 예방하고 접수합니다.' },
  ],
  finalHead: '메이플랜드 디스코드,\n지금 입장하세요.',
  discordUrl: 'https://discord.gg/2UwBw8dnSv',
  breadcrumbName: '메이플랜드 디스코드',
  meta: {
    title: '메이플랜드 디스코드 거래방·파티모집',
    description: '메이플랜드(메랜) 디스코드. 빅뱅 전 구버전 클래식 서버의 메소·아이템 거래와 사냥·보스 파티 모집을 한 곳에서. 인증·신고문의로 안전하게 거래하세요.',
  },
};

export const mapleplanet: ServerData = {
  key: 'mapleplanet', path: '/mapleplanet', emoji: '🪐', eng: 'MaplePlanet',
  name: '메이플플래닛 디스코드',
  sub: '플래닛 거래·파티/쩔에, 자리 판매까지.',
  aboutHead: '자리 판매까지 되는 플래닛 허브.',
  about: [
    '메이플플래닛 디스코드는 빅뱅 전 구버전 플래닛 유저를 위한 거래방과 파티·쩔 채널을 운영합니다. 플래닛 거래방에서 메소·아이템을 거래하고, 파티·쩔 채널에서 사냥 파티와 쩔을 구할 수 있습니다.',
    '특히 자리 판매 채널은 좋은 사냥터 자리를 사고파는 플래닛 특화 공간으로, 다른 서버에는 없는 핵심 기능입니다. 공지·자유대화·가이드 통합 채널과 신고문의로 안전하게 이용하세요.',
  ],
  feature: { name: '자리 판매 (플래닛 특화)', desc: '좋은 사냥터 자리를 사고파는 플래닛 전용 채널. 다른 서버에는 없는 핵심 기능입니다.' },
  channels: [
    { name: '플래닛 거래방', desc: '메이플플래닛 메소·아이템 거래 전용' },
    { name: '파티·쩔', desc: '파티 모집, 쩔 구인을 바로 매칭' },
    { name: '커뮤니티 + 안전', desc: '공지·자유대화·가이드 + 신고문의' },
  ],
  faq: [
    { q: '자리 판매가 뭔가요?', a: '사냥터의 좋은 자리를 사고파는 플래닛 특화 채널입니다.' },
    { q: '메이플플래닛은 어떤 서버인가요?', a: '빅뱅 전 구버전 메이플스토리를 즐기는 클래식 서버입니다.' },
    { q: '쩔도 구할 수 있나요?', a: '파티·쩔 채널에서 쩔과 사냥 파티를 구할 수 있습니다.' },
    { q: '안전하게 거래할 수 있나요?', a: '신고문의 채널로 문제 거래를 접수해 사기를 예방합니다.' },
  ],
  finalHead: '메이플플래닛 디스코드,\n지금 입장하세요.',
  discordUrl: 'https://discord.gg/2UwBw8dnSv',
  breadcrumbName: '메이플플래닛 디스코드',
  meta: {
    title: '메이플플래닛 디스코드 거래방·파티',
    description: '메이플플래닛 디스코드. 빅뱅 전 구버전 플래닛의 메소·아이템 거래, 파티·쩔, 자리 판매까지. 신고문의로 안전하게 이용하세요.',
  },
};

export function buildMetadata(d: ServerData): Metadata {
  return {
    title: d.meta.title,
    description: d.meta.description,
    alternates: { canonical: `${BASE}${d.path}` },
    openGraph: { url: d.path, title: d.meta.title, description: d.meta.description },
  };
}
