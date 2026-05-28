import { useState } from 'react';
import { ingestFile } from '../api/client';

const SOURCE_TYPES = ['SAP', 'UTILITY', 'TRAVEL'];

export default function IngestionPanel({ tenantId, onSuccess }) {
  const [sourceType, setSourceType] = useState('SAP');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await ingestFile(tenantId, sourceType, file);
      setResult(res.data);
      onSuccess?.();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ingest-panel">
      <h2>Ingest Data</h2>

      <div className="source-selector">
        {SOURCE_TYPES.map(s => (
          <button
            key={s}
            className={`source-btn ${sourceType === s ? 'active' : ''}`}
            onClick={() => setSourceType(s)}
          >
            {s === 'SAP'     && '🏭 SAP Export'}
            {s === 'UTILITY' && '⚡ Utility CSV'}
            {s === 'TRAVEL'  && '✈️ Travel Export'}
          </button>
        ))}
      </div>

      <div className="format-hint">
        {sourceType === 'SAP'     && <p>Tab or semicolon-delimited flat file. Required columns: BUDAT, WERKS, MENGE, MEINS. German headers accepted.</p>}
        {sourceType === 'UTILITY' && <p>Portal CSV export. Requires a consumption column (kWh, MWh, or GJ) and billing period dates.</p>}
        {sourceType === 'TRAVEL'  && <p>Concur/Navan expense export CSV. Columns: expense_type, transaction_date, from_airport, to_airport, hotel_nights, distance_km.</p>}
      </div>

      <div className="file-drop">
        <input type="file" accept=".csv,.txt,.tsv" onChange={e => setFile(e.target.files[0])} />
        {file && <span className="filename">📄 {file.name}</span>}
      </div>

      <button className="btn-primary" onClick={handleSubmit} disabled={!file || loading}>
        {loading ? 'Processing...' : 'Upload & Ingest'}
      </button>

      {result && (
        <div className="result-box success">
          <strong>✅ Ingested successfully</strong>
          <p>Records created: {result.records_created}</p>
          <p>Parse errors: {result.errors?.length || 0}</p>
          {result.errors?.length > 0 && (
            <details>
              <summary>View errors</summary>
              <pre>{JSON.stringify(result.errors, null, 2)}</pre>
            </details>
          )}
        </div>
      )}

      {error && (
        <div className="result-box error">
          <strong>❌ Ingestion failed</strong>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
