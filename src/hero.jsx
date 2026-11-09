export function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 445 176" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="study-dots" width="15" height="15" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1" fill="#bdb1ec" opacity=".34"/>
        </pattern>
      </defs>
      <path d="M66 0h379v176H0Z" fill="#242044"/>
      <path d="M153 0h292v176H88Z" fill="url(#study-dots)"/>
      <path d="M62 151h69l31-37h50m82-65h54l29-27h68M321 119h56l26 28h42" fill="none" stroke="#8d7fc7" strokeWidth="1.1" opacity=".6"/>
      <circle cx="131" cy="151" r="3" fill="#b9a8f7"/>
      <circle cx="377" cy="22" r="3" fill="#b9a8f7"/>
      <circle cx="377" cy="119" r="3" fill="#9cdec4"/>
      <g transform="translate(210 22) rotate(-8 58 70)">
        <rect x="17" y="4" width="113" height="129" rx="12" fill="#38305f" stroke="#7f70bb"/>
        <rect x="5" y="13" width="113" height="129" rx="12" fill="#4a3e7c" stroke="#9d8cda"/>
        <rect x="-7" y="22" width="113" height="129" rx="12" fill="#2c254e" stroke="#bbaaf6" strokeWidth="1.25"/>
        <path d="M10 40h37" stroke="#cdbdf9" strokeWidth="4" strokeLinecap="round"/>
        <path d="M35 67h48m-48 23h38m-38 23h44" stroke="#9688c2" strokeWidth="3.3" strokeLinecap="round"/>
        <rect x="10" y="60" width="14" height="14" rx="4" fill="#6954af" stroke="#b9a8f7"/>
        <path d="m13.5 67 2.3 2.3 4.6-4.8" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="10" y="83" width="14" height="14" rx="4" fill="#254b48" stroke="#9cdec4"/>
        <path d="m13.5 90 2.3 2.3 4.6-4.8" fill="none" stroke="#b9f0da" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="10" y="106" width="14" height="14" rx="4" fill="none" stroke="#9b8acb"/>
      </g>
    </svg>
  );
}
