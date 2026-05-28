import { useEffect, useState } from 'react';
import { getRecords, approveRecord, rejectRecord, lockRecord, getRecordHistory } from '../api/client';

const STATUS_COLORS = {
  PENDING: 'amber', FLAGGED: 'red', APPROVED: 'green',
  REJECTED: 'gray', LOCKED: 'blue',
};

export default function ReviewTable({ tenantId }) {
  const [records, setRecords]   = useState([]);
  const [filter, setFilter]     = useState('PENDING');
  const [selected, setSelected] = useState(null);
  const [history, setHistory]   = useState([]);
  const [note, setNote]         = useState('');
  const [loading, setLoading]   = useState(false);

  const load = () => {
    setLoading(true);
    getRecords({ tenant: tenantId, status: filter, page_size: 100 })
      .then(r => setRecords(r.data.results || r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter, tenantId]);

  const openRecord = async (rec) => {
    setSelected(rec);
    setNote(rec.analyst_note || '');
    const hist = await getRecordHistory(rec.id);
    setHistory(hist.data);
  };

  const doApprove = async () => {
    await approveRecord(selected.id, note);
    setSelected(null);
    load();
  };

  const doReject = async () => {
    await rejectRecord(selected.id, note);
    setSelected(null);
    load();
  };

  const doLock = async () => {
    await lockRecord(selected.id);
    setSelected(null);
    load();
  };

  return (
    <div className="review-panel">
      <h2>Review Queue</h2>

      <div className="filter-bar">
        {['PENDING', 'FLAGGED', 'APPROVED', 'REJECTED', 'LOCKED'].map(s => (
          <button
            key={s}
            className={`filter-btn ${filter === s ? 'active' : ''} status-${STATUS_COLORS[s]}`}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? <div className="loading">Loading records...</div> : (
        <table className="records-table">
          <thead>
            <tr>
              <th>Date</th><th>Source</th><th>Description</th>
              <th>Scope</th><th>Qty</th><th>Unit</th>
              <th>CO₂e (kg)</th><th>Status</th><th>Flag</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr
                key={r.id}
                className={r.flag_reason ? 'flagged-row' : ''}
                onClick={() => openRecord(r)}
                style={{ cursor: 'pointer' }}
              >
                <td>{r.activity_date}</td>
                <td><span className={`badge badge-${r.batch_filename?.split('.')[0].toLowerCase().slice(0,3)}`}>
                  {r.category_display?.split('—')[0].trim()}
                </span></td>
                <td>{r.activity_description?.slice(0, 50)}</td>
                <td>{r.scope_display?.split('—')[0].trim()}</td>
                <td>{parseFloat(r.raw_quantity)?.toFixed(2)}</td>
                <td>{r.raw_unit}</td>
                <td>{r.co2e_kg ? parseFloat(r.co2e_kg).toFixed(3) : '—'}</td>
                <td><span className={`badge badge-${STATUS_COLORS[r.status]}`}>{r.status}</span></td>
                <td className="flag-cell">{r.flag_reason ? '⚠️' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {records.length === 0 && !loading && (
        <div className="empty-state">No records with status: {filter}</div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div className="drawer-overlay" onClick={() => setSelected(null)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelected(null)}>✕</button>
            <h3>Record Detail</h3>

            <div className="detail-grid">
              <Field label="Date"        value={selected.activity_date} />
              <Field label="Description" value={selected.activity_description} />
              <Field label="Scope"       value={selected.scope_display} />
              <Field label="Category"    value={selected.category_display} />
              <Field label="Quantity"    value={`${selected.raw_quantity} ${selected.raw_unit}`} />
              <Field label="CO₂e"        value={selected.co2e_kg ? `${parseFloat(selected.co2e_kg).toFixed(4)} kg` : 'Not computed'} />
              <Field label="Source"      value={selected.source_entity} />
              <Field label="Location"    value={selected.source_location} />
              <Field label="EF Used"     value={selected.emission_factor_used} />
              <Field label="Status"      value={selected.status_display} />
              {selected.flag_reason && <Field label="⚠️ Flag" value={selected.flag_reason} highlight />}
            </div>

            <label className="note-label">Analyst Note</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a note..."
              disabled={selected.status === 'LOCKED'}
            />

            {selected.status !== 'LOCKED' && (
              <div className="action-btns">
                <button className="btn-approve" onClick={doApprove}>✓ Approve</button>
                <button className="btn-reject"  onClick={doReject}>✗ Reject</button>
                {selected.status === 'APPROVED' && (
                  <button className="btn-lock" onClick={doLock}>🔒 Lock for Audit</button>
                )}
              </div>
            )}

            <h4>Audit Trail</h4>
            <div className="audit-trail">
              {history.map(e => (
                <div key={e.id} className="audit-event">
                  <span className="audit-time">{new Date(e.timestamp).toLocaleString()}</span>
                  <span className={`badge badge-${e.action.toLowerCase()}`}>{e.action}</span>
                  <span>{e.actor_name}</span>
                  {e.detail?.reason && <span className="audit-detail"> — {e.detail.reason}</span>}
                  {e.detail?.note   && <span className="audit-detail"> — {e.detail.note}</span>}
                </div>
              ))}
            </div>

            <h4>Raw Source Row</h4>
            <pre className="raw-row">{JSON.stringify(selected.raw_source_row, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, highlight }) {
  return (
    <div className={`field ${highlight ? 'highlight' : ''}`}>
      <span className="field-label">{label}</span>
      <span className="field-value">{value || '—'}</span>
    </div>
  );
}
