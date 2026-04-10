export default function AuthAnimation() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 400 480"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <style>{`
        @keyframes pulse0 { 0%,100%{opacity:.08} 50%{opacity:.35} }
        @keyframes pulse1 { 0%,100%{opacity:.12} 50%{opacity:.40} }
        @keyframes pulse2 { 0%,100%{opacity:.06} 50%{opacity:.28} }
        .l0{animation:pulse0 5s ease-in-out infinite}
        .l1{animation:pulse1 7s ease-in-out infinite 1s}
        .l2{animation:pulse2 6s ease-in-out infinite 2s}
        .l3{animation:pulse0 8s ease-in-out infinite 0.5s}
        .l4{animation:pulse1 5s ease-in-out infinite 1.5s}
        .l5{animation:pulse2 7s ease-in-out infinite 3s}
        .l6{animation:pulse0 6s ease-in-out infinite 2.5s}
        .l7{animation:pulse1 9s ease-in-out infinite 0.8s}
        .l8{animation:pulse2 5s ease-in-out infinite 1.2s}
        .l9{animation:pulse0 7s ease-in-out infinite 3.5s}
      `}</style>

      {/* lines */}
      <g stroke="#90b8f8" strokeWidth="0.8" fill="none">
        <line className="l0" x1="80"  y1="120" x2="200" y2="80" />
        <line className="l1" x1="200" y1="80"  x2="320" y2="160"/>
        <line className="l2" x1="80"  y1="120" x2="160" y2="240"/>
        <line className="l3" x1="160" y1="240" x2="320" y2="160"/>
        <line className="l4" x1="160" y1="240" x2="240" y2="360"/>
        <line className="l5" x1="320" y1="160" x2="340" y2="300"/>
        <line className="l6" x1="240" y1="360" x2="340" y2="300"/>
        <line className="l7" x1="200" y1="80"  x2="160" y2="240"/>
        <line className="l8" x1="60"  y1="320" x2="160" y2="240"/>
        <line className="l9" x1="60"  y1="320" x2="240" y2="360"/>
      </g>

      {/* nodes — static */}
      <g fill="#90b8f8">
        <circle cx="80"  cy="120" r="3.5" opacity=".6"/>
        <circle cx="200" cy="80"  r="4.5" opacity=".8"/>
        <circle cx="320" cy="160" r="3.5" opacity=".6"/>
        <circle cx="160" cy="240" r="5"   opacity=".85"/>
        <circle cx="340" cy="300" r="3.5" opacity=".6"/>
        <circle cx="240" cy="360" r="4"   opacity=".7"/>
        <circle cx="60"  cy="320" r="3"   opacity=".5"/>

      </g>
    </svg>
  )
}