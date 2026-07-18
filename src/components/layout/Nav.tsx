import { NavLink, useLocation } from 'react-router-dom';
import { FilterBar } from '../filters/FilterBar';

const LINKS = [
  { to: '/', label: 'Map', end: true },
  { to: '/dashboard', label: 'Insights' },
  { to: '/about', label: 'Methodology' },
];

function linkClasses(isActive: boolean): string {
  const base = 'px-3 py-2 text-sm font-medium rounded-md transition-colors';
  return isActive
    ? `${base} bg-brand-50 text-brand-700`
    : `${base} text-ink-secondary hover:bg-surface-sunken hover:text-ink-primary`;
}

export function Nav() {
  const location = useLocation();
  const showFilters = location.pathname === '/' || location.pathname === '/dashboard';

  return (
    <header className="sticky top-0 z-[1000] flex flex-col border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="#0a4d48" />
            <path
              d="M6 22 L16 8 L26 22"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="17" r="2.2" fill="#5eead4" />
          </svg>
          <span className="text-base font-semibold tracking-tight text-ink-primary">Crossings</span>
        </NavLink>
        <nav className="flex items-center gap-1">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => linkClasses(isActive)}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
      {showFilters && <FilterBar />}
    </header>
  );
}
