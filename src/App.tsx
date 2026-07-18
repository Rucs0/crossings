import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Nav } from './components/layout/Nav';
import { FiltersProvider } from './context/FiltersContext';
import { HomePage } from './pages/HomePage';

// Recharts is the single largest dependency in the bundle; deferring the
// dashboard route keeps it out of the initial load so the map — the app's
// hero and first impression — paints as fast as possible.
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));

function App() {
  return (
    <FiltersProvider>
      <div className="flex h-full flex-col">
        <Nav />
        <main className="min-h-0 flex-1">
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </FiltersProvider>
  );
}

export default App;
