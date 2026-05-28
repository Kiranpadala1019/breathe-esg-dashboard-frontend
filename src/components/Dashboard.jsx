import { useEffect, useState } from 'react';
import { getDashboard, getBatches } from '../api/client';

const SCOPE_LABELS = { 1: 'Scope 1 — Direct', 2: 'Scope 2 — Electricity', 3: 'Scope 3 — Value Chain' };

export default function Dashboard({ tenantId }) {
  const [summary, setSummary] = useState(null);
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    getDashboard(tenantId).then(r => setSummary(r.data));
    getBatches(tenantId).then(r => setBatches(r.data.results || r.data));
  }, [tenantId]);

  if (!summary) return <div className="loading">Loading dashboard...</div>;

  const { total_records, total_co2e_kg, by_status, by_scope_co2e,
          pending_count, flagged_count, approved_count } = summary;

  return (
    <div className="dashboard">
      <h2>Emissions Overview</h2>

      <div className="stat-grid">
        <StatCard label="Total Records"    value={total_records}             color="blue" />
        <StatCard label="Total CO₂e (kg)"  value={total_co2e_kg?.toFixed(1)} color="green" />
        <StatCard label="Pending Review"   value={pending_count}             color="amber" />
        <StatCard label="Flagged"          value={flagged_count}             color="red" />
        <StatCard label="Approved"         value={approved_count}            color="teal" />
      </div>

      <h3>CO₂e by Scope (kg)</h3>
      <div className="scope-bars">
        {Object.entries(by_scope_co2e).map(([scope, val]) => (
          <div key={scope} className="scope-row">
            <span>{SCOPE_LABELS[scope] || `Scope ${scope}`}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${Math.min(100, (val / (total_co2e_kg || 1)) * 100)}%` }}
              />
            </div>
            <span>{val.toFixed(1)} kg</span>
          </div>
        ))}
      </div>

      <h3>Recent Batches</h3>
      <table className="batch-table">
        <thead>
          <tr><th>Source</th><th>File</th><th>Uploaded</th><th>Records</th><th>Errors</th><th>Status</th></tr>
        </thead>
        <tbody>
          {batches.slice(0, 10).map(b => (
            <tr key={b.id}>
              <td><span className={`badge badge-${b.source_type.toLowerCase()}`}>{b.source_type}</span></td>
              <td>{b.filename}</td>
              <td>{new Date(b.uploaded_at).toLocaleString()}</td>
              <td>{b.row_count}</td>
              <td className={b.error_count > 0 ? 'error-cell' : ''}>{b.error_count}</td>
              <td><span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
