/** Simple inline SVG icons — no external deps needed */
export function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

export function IconDocument({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

export function IconBook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

export function IconTrophy({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 19.24 7 20h10c0-.76-.85-1.25-2.03-1.79C14.47 17.98 14 17.55 14 17v-2.34" />
      <path d="M18 2H6v7a6 6 0 0012 0V2z" />
    </svg>
  );
}

export function IconSettings({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

export function IconLogout({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function IconPlus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function IconBack({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function IconFootball({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      <path d="M2 12h20" />
    </svg>
  );
}

export function IconKaupanger({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 72"
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      aria-hidden="true"
    >
      <path
        d="M32 3C23 3 15 10 6 14v21c0 18 12 29 26 34 14-5 26-16 26-34V14C49 10 41 3 32 3z"
        fill="#9ED9FF"
      />
      <path
        d="M9 35h46c-2 13-11 22-23 27C20 57 11 48 9 35z"
        fill="#F2DC52"
      />
      <path d="M6 14C15 10 23 3 32 3c9 0 17 7 26 11" stroke="#7FC7F5" strokeWidth="2" fill="none" />

      <path d="M12 30l4-10 4 10h-3l2 5-6-8h3z" fill="#1C8A6A" />
      <path d="M52 30l-4-10-4 10h3l-2 5 6-8h-3z" fill="#1C8A6A" />

      <path
        d="M18 24c4 0 8-3 10-7 1 2 3 4 6 4 2 0 4-1 6-3 0 4 4 7 8 7-2 2-4 3-7 3-2 0-4 0-6-1-3 3-6 4-11 4-3 0-6-1-8-3 1-2 1-3 2-4z"
        fill="#0E1111"
      />
      <path d="M22 31h20" stroke="#0E1111" strokeWidth="3" strokeLinecap="round" />

      <path d="M16 51c3-2 6-2 8 0-2 2-5 3-8 3v-3z" fill="#1C8A6A" />
      <path d="M30 53V44" stroke="#1C8A6A" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M39 53V44" stroke="#1C8A6A" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M22 53V44c3 0 5 1 6 3-1 3-3 5-6 6z" fill="#1C8A6A" />
      <path d="M44 53c2-1 4-3 5-6-1-2-3-3-5-3v9z" fill="#1C8A6A" />

      <rect x="1" y="1" width="62" height="70" rx="20" fill="none" stroke="#9ED9FF" strokeWidth="1.8" />
    </svg>
  );
}

export function IconWallet({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M21 12V7H5a2 2 0 010-4h14v4" />
      <path d="M3 5v14a2 2 0 002 2h16v-5" />
      <path d="M18 12a2 2 0 100 4h4v-4h-4z" />
    </svg>
  );
}

export function IconTrash({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

export function IconEdit({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function IconCake({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <path d="M20 21v-8a2 2 0 00-2-2H6a2 2 0 00-2 2v8" />
      <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
      <path d="M2 21h20" />
      <path d="M7 8v3" />
      <path d="M12 8v3" />
      <path d="M17 8v3" />
      <path d="M7 4h.01" />
      <path d="M12 4h.01" />
      <path d="M17 4h.01" />
    </svg>
  );
}
