import { useState } from 'react';
import Dashboard from './components/Dashboard';
import IngestionPanel from './components/IngestionPanel';
import ReviewTable from './components/ReviewTable';

const TENANT_ID = '00000000-0000-0000-0000-000000000001'; // seeded demo tenant

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const onIngested = () => {
    setRefreshKey(k => k + 1);
    setTab('review');
  };

  return (
    <div className="app">
      <header className="topbar">
        <span className="logo">🌿 Breathe ESG</span>
        <nav>
          {['dashboard', 'ingest', 'review'].map(t => (
            <button
              key={t}
              className={tab === t ? 'active' : ''}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>
      </header>
      <main>
        {tab === 'dashboard' && <Dashboard tenantId={TENANT_ID} key={refreshKey} />}
        {tab === 'ingest'    && <IngestionPanel tenantId={TENANT_ID} onSuccess={onIngested} />}
        {tab === 'review'    && <ReviewTable tenantId={TENANT_ID} key={refreshKey} />}
      </main>
    </div>
  );
}
