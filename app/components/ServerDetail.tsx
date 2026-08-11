import type { ServerData, ServerKey } from '../data/servers';

const ACCENT: Record<ServerKey, { text: string; dot: string; btn: string; ring: string }> = {
  maplestory:  { text: 'text-amber-500',  dot: 'bg-amber-500',  btn: 'bg-amber-500 hover:bg-amber-600',   ring: 'focus-visible:ring-amber-500/40' },
  mapleland:   { text: 'text-green-500',  dot: 'bg-green-500',  btn: 'bg-green-500 hover:bg-green-600',   ring: 'focus-visible:ring-green-500/40' },
  mapleplanet: { text: 'text-purple-500', dot: 'bg-purple-500', btn: 'bg-purple-500 hover:bg-purple-600', ring: 'focus-visible:ring-purple-500/40' },
};

const BASE = 'https://www.maplediscord.com';

export default function ServerDetail({ data }: { data: ServerData }) {
  const a = ACCENT[data.key];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: BASE },
      { '@type': 'ListItem', position: 2, name: data.breadcrumbName, item: `${BASE}${data.path}` },
    ],
  };
  const faqJsonLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: data.faq.map((f) => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const btn = `inline-flex items-center gap-2 rounded-full px-7 py-[15px] text-base font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 ${a.btn} ${a.ring}`;
  const eyebrow = `inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] ${a.text}`;
  const h2 = 'mt-4 text-[clamp(26px,3.6vw,33px)] font-semibold leading-[1.25] tracking-[-0.032em]';

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="bg-white text-gray-900">
        {/* HERO */}
        <section className="pt-24 pb-20 md:pt-[118px] md:pb-[104px]">
          <div className="mx-auto max-w-[760px] px-7">
            <div className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-gray-400">
              <span className="text-[15px] tracking-normal">{data.emoji}</span>{data.eng}
            </div>
            <h1 className="mt-5 text-[clamp(40px,6vw,58px)] [font-weight:560] leading-[1.06] tracking-[-0.038em] [word-break:keep-all]">
              {data.name}
            </h1>
            <p className="mt-5 max-w-[34ch] text-[clamp(17px,2.1vw,20px)] [font-weight:450] leading-[1.6] text-gray-500 [word-break:keep-all]">
              {data.sub}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a href={data.discordUrl} className={btn}>디스코드 입장하기 <span aria-hidden>→</span></a>
              <span className="text-[13.5px] text-gray-400">본서버 인증 유저만 · 무료 입장</span>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="border-t border-gray-100 py-[68px] md:py-[100px]">
          <div className="mx-auto max-w-[760px] px-7">
            <div className={eyebrow}><span className={`h-[5px] w-[5px] rounded-full ${a.dot}`} />ABOUT</div>
            <h2 className={`${h2} [word-break:keep-all]`}>{data.aboutHead}</h2>
            {data.about.map((p, i) => (
              <p key={i} className="mt-5 text-[16.5px] leading-[1.85] text-gray-500 [word-break:keep-all]">{p}</p>
            ))}
          </div>
        </section>

        {/* CHANNELS */}
        <section className="border-t border-gray-100 py-[68px] md:py-[100px]">
          <div className="mx-auto max-w-[760px] px-7">
            <div className={eyebrow}><span className={`h-[5px] w-[5px] rounded-full ${a.dot}`} />CHANNELS</div>
            <h2 className={`${h2} [word-break:keep-all]`}>이런 채널이 있어요</h2>

            <div className="mt-10">
              <div className="flex items-center gap-2.5 text-[22px] font-semibold tracking-[-0.025em] [word-break:keep-all]">
                <span className={`h-[7px] w-[7px] rounded-full ${a.dot}`} />{data.feature.name}
              </div>
              <p className="mt-3 text-[15.5px] leading-[1.7] text-gray-500 [word-break:keep-all]">{data.feature.desc}</p>
              {data.feature.worlds && (
                <p className="mt-4 text-[13.5px] leading-[1.8] text-gray-400 [word-break:keep-all]">{data.feature.worlds}</p>
              )}
            </div>

            <ul className="mt-3.5">
              {data.channels.map((c) => (
                <li key={c.name} className="grid grid-cols-1 gap-1.5 border-t border-gray-100 py-6 md:grid-cols-[200px_1fr] md:gap-4">
                  <div className="text-[17px] font-semibold tracking-[-0.02em] [word-break:keep-all]">{c.name}</div>
                  <div className="text-[15px] leading-[1.6] text-gray-500 [word-break:keep-all]">{c.desc}</div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-gray-100 py-[68px] md:py-[100px]">
          <div className="mx-auto max-w-[760px] px-7">
            <div className={eyebrow}><span className={`h-[5px] w-[5px] rounded-full ${a.dot}`} />FAQ</div>
            <h2 className={`${h2} [word-break:keep-all]`}>자주 묻는 질문</h2>
            <div className="mt-5">
              {data.faq.map((f) => (
                <div key={f.q} className="border-t border-gray-100 py-[26px]">
                  <div className="relative pl-[22px] text-[17px] font-semibold tracking-[-0.02em] [word-break:keep-all]">
                    <span className={`absolute left-0 top-0 font-bold ${a.text}`}>Q</span>{f.q}
                  </div>
                  <div className="ml-[22px] mt-3 text-[15px] leading-[1.75] text-gray-500 [word-break:keep-all]">{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="border-t border-gray-100 py-24 text-center md:py-[120px]">
          <div className="mx-auto max-w-[760px] px-7">
            <h2 className="whitespace-pre-line text-[clamp(28px,4vw,38px)] [font-weight:560] leading-[1.2] tracking-[-0.035em] [word-break:keep-all]">
              {data.finalHead}
            </h2>
            <a href={data.discordUrl} className={`mt-8 ${btn}`}>입장하기 <span aria-hidden>→</span></a>
          </div>
        </section>
      </div>
    </>
  );
}
