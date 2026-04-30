import { cn } from "@/lib/utils/cn";

export function TradingJournalIllustration({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  return (
    <svg
      className={cn("rtl-mirror h-auto w-full", className)}
      viewBox="0 0 560 360"
      role="img"
      aria-labelledby="trading-journal-illustration-title"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="trading-journal-illustration-title">{title}</title>
      <defs>
        <linearGradient id="journal-surface" x1="86" x2="474" y1="58" y2="318" gradientUnits="userSpaceOnUse">
          <stop stopColor="#17243A" />
          <stop offset="1" stopColor="#0D1421" />
        </linearGradient>
        <linearGradient id="chart-glow" x1="190" x2="464" y1="118" y2="242" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3DD9B4" stopOpacity="0.42" />
          <stop offset="1" stopColor="#67B3FF" stopOpacity="0.1" />
        </linearGradient>
        <filter id="soft-shadow" x="44" y="28" width="474" height="312" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
          <feOffset dy="18" />
          <feGaussianBlur stdDeviation="22" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.32 0" />
          <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow_1" mode="normal" result="shape" />
        </filter>
      </defs>

      <rect x="56" y="42" width="448" height="276" rx="28" fill="#0A101B" opacity="0.72" />
      <g filter="url(#soft-shadow)">
        <rect x="78" y="54" width="404" height="252" rx="24" fill="url(#journal-surface)" stroke="#24324A" />
      </g>

      <path d="M126 86H282" stroke="#90A0BC" strokeOpacity="0.22" strokeWidth="10" strokeLinecap="round" />
      <path d="M126 112H226" stroke="#90A0BC" strokeOpacity="0.16" strokeWidth="8" strokeLinecap="round" />
      <circle cx="426" cy="104" r="34" fill="#3DD9B4" fillOpacity="0.08" stroke="#3DD9B4" strokeOpacity="0.28" />
      <path d="M412 105L423 116L444 89" fill="none" stroke="#3DD9B4" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />

      <rect x="110" y="144" width="328" height="120" rx="18" fill="#0B1220" stroke="#263653" />
      <path d="M130 228H420" stroke="#90A0BC" strokeOpacity="0.12" />
      <path d="M130 196H420" stroke="#90A0BC" strokeOpacity="0.12" />
      <path d="M130 164H420" stroke="#90A0BC" strokeOpacity="0.12" />
      <path d="M160 158V248" stroke="#90A0BC" strokeOpacity="0.08" />
      <path d="M218 158V248" stroke="#90A0BC" strokeOpacity="0.08" />
      <path d="M276 158V248" stroke="#90A0BC" strokeOpacity="0.08" />
      <path d="M334 158V248" stroke="#90A0BC" strokeOpacity="0.08" />
      <path d="M392 158V248" stroke="#90A0BC" strokeOpacity="0.08" />

      <path d="M136 232C162 216 175 218 192 202C212 183 232 188 250 176C274 160 292 168 314 184C340 203 362 194 382 178C397 166 410 161 432 158" fill="none" stroke="url(#chart-glow)" strokeWidth="36" strokeLinecap="round" opacity="0.26" />
      <path d="M136 232C162 216 175 218 192 202C212 183 232 188 250 176C274 160 292 168 314 184C340 203 362 194 382 178C397 166 410 161 432 158" fill="none" stroke="#3DD9B4" strokeWidth="4" strokeLinecap="round" />
      <path d="M136 236C162 224 180 226 203 212C226 198 248 204 269 192C293 178 312 188 334 206C358 225 379 218 400 204C414 195 424 190 438 188" fill="none" stroke="#FF5D73" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round" strokeDasharray="7 10" />

      <g strokeLinecap="round">
        <path d="M164 182V232" stroke="#3DD9B4" strokeWidth="3" />
        <rect x="156" y="196" width="16" height="24" rx="4" fill="#3DD9B4" />
        <path d="M206 180V224" stroke="#FF5D73" strokeWidth="3" />
        <rect x="198" y="190" width="16" height="22" rx="4" fill="#FF5D73" />
        <path d="M248 170V216" stroke="#3DD9B4" strokeWidth="3" />
        <rect x="240" y="184" width="16" height="18" rx="4" fill="#3DD9B4" />
        <path d="M290 166V226" stroke="#67B3FF" strokeWidth="3" />
        <rect x="282" y="178" width="16" height="34" rx="4" fill="#67B3FF" />
        <path d="M332 176V232" stroke="#FF5D73" strokeWidth="3" />
        <rect x="324" y="190" width="16" height="28" rx="4" fill="#FF5D73" />
        <path d="M374 158V210" stroke="#3DD9B4" strokeWidth="3" />
        <rect x="366" y="172" width="16" height="24" rx="4" fill="#3DD9B4" />
      </g>

      <rect x="116" y="278" width="76" height="10" rx="5" fill="#3DD9B4" fillOpacity="0.82" />
      <rect x="204" y="278" width="54" height="10" rx="5" fill="#67B3FF" fillOpacity="0.72" />
      <rect x="270" y="278" width="42" height="10" rx="5" fill="#FF5D73" fillOpacity="0.72" />
      <rect x="324" y="278" width="84" height="10" rx="5" fill="#90A0BC" fillOpacity="0.24" />

      <g transform="translate(60 202)">
        <rect width="110" height="82" rx="18" fill="#101725" stroke="#263653" />
        <path d="M20 24H60" stroke="#90A0BC" strokeOpacity="0.34" strokeWidth="6" strokeLinecap="round" />
        <path d="M20 44H84" stroke="#3DD9B4" strokeOpacity="0.75" strokeWidth="7" strokeLinecap="round" />
        <path d="M20 62H72" stroke="#90A0BC" strokeOpacity="0.2" strokeWidth="6" strokeLinecap="round" />
      </g>

      <g transform="translate(386 220)">
        <rect width="112" height="74" rx="18" fill="#101725" stroke="#263653" />
        <path d="M20 53V38" stroke="#3DD9B4" strokeWidth="8" strokeLinecap="round" />
        <path d="M40 53V26" stroke="#67B3FF" strokeWidth="8" strokeLinecap="round" />
        <path d="M60 53V34" stroke="#3DD9B4" strokeWidth="8" strokeLinecap="round" />
        <path d="M80 53V20" stroke="#F6AD55" strokeWidth="8" strokeLinecap="round" />
      </g>
    </svg>
  );
}
