const desenhos = {
  home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9" /><path d="M9 20v-6h6v6" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" /><path d="M9 3v15" /><path d="M15 6v15" /></>,
  notebook: <><path d="M5 4h14v17H5z" /><path d="M8 4v17" /><path d="M11 8h5M11 12h5M11 16h4" /><path d="M3 7h2M3 12h2M3 17h2" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  sparkles: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z" /><path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1z" /></>,
  flame: <><path d="M12 22c4.4 0 7-3 7-7 0-2.6-1.4-5.2-4-7-.1 2-1 3.1-2 3.8C13 8.5 11 5.3 8 3 8.5 7 6 9 5 12c-2.1 6.1 1.1 10 7 10Z" /><path d="M12 22c-2 0-3-1.4-3-3 0-1.3.8-2.4 2-3.5.2 1.1.9 1.6 1.8 2.1.8-1 1.1-1.8 1.2-2.8 1.2 1.1 2 2.5 2 4.1 0 1.7-1.4 3.1-4 3.1Z" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.8 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.8-1l-1.7.7-1.4-2.4L7.1 15a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.8-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.8 1l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1 0 2Z" transform="translate(-1 -1)" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  braces: <><path d="M8 4H6a2 2 0 0 0-2 2v3a2 2 0 0 1-2 2 2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h2" /><path d="M16 4h2a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2 2 2 0 0 0-2 2v3a2 2 0 0 1-2 2h-2" /></>,
  database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>,
  layout: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M9 9v11" /></>,
  rocket: <><path d="M5 15c-1.5 1-2 3-2 5 2 0 4-.5 5-2" /><path d="M8 14 5 11c2-5 7-8 14-8 0 7-3 12-8 14l-3-3Z" /><circle cx="15" cy="9" r="2" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  arrowRight: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  minus: <path d="M5 12h14" />,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  maximize: <><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3" /></>,
  pointer: <><path d="m5 3 14 11-7 1-3 6z" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
  sailboat: <><path d="M12 3v12M12 4 5 13h7M12 7l7 6h-7" /><path d="M3 17c2 2 4 2 6 0 2 2 4 2 6 0 2 2 4 2 6 0" /></>,
};

function Icon({ name, className = '', size = 20, fill = 'none' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      {desenhos[name] || <circle cx="12" cy="12" r="9" />}
    </svg>
  );
}

export default Icon;
