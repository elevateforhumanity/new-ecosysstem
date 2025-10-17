/**
 * Identity Mapping Panel
 * Upload CSV to map LMS user IDs to Google emails
 */

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface ImportBatch {
  import_batch_id: string;
  lms_source: string;
  imported_at: string;
  record_count: number;
  applied: boolean;
}

interface IdentitySummary {
  lms_source: string;
  total_mappings: number;
  unique_emails: number;
  last_updated: string;
}

export default function IdentityMappingPanel() {
  const [uploading, setUploading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [summary, setSummary] = useState<IdentitySummary[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data on mount
  useState(() => {
    loadBatches();
    loadSummary();
  });

  const loadBatches = async () => {
    const { data, error } = await supabase
      .from('lms_identity_import')
      .select('import_batch_id, lms_source, imported_at, applied')
      .eq('applied', false)
      .order('imported_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      // Group by batch and count
      const batchMap = new Map<string, ImportBatch>();
      data.forEach((row: any) => {
        const key = row.import_batch_id;
        if (!batchMap.has(key)) {
          batchMap.set(key, {
            import_batch_id: row.import_batch_id,
            lms_source: row.lms_source,
            imported_at: row.imported_at,
            record_count: 0,
            applied: row.applied,
          });
        }
        batchMap.get(key)!.record_count++;
      });
      setBatches(Array.from(batchMap.values()));
    }
  };

  const loadSummary = async () => {
    const { data, error } = await supabase
      .from('v_lms_identity_summary')
      .select('*');

    if (!error && data) {
      setSummary(data);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const text = await file.text();
      const lines = text.trim().split('\n');

      if (lines.length < 2) {
        throw new Error('CSV file must have at least a header and one data row');
      }

      // Parse CSV
      const records = [];
      const batchId = crypto.randomUUID();

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(',').map(p => p.trim());
        if (parts.length < 3) {
          console.error(`Skipping invalid line ${i + 1}: ${line}`);
          continue;
        }

        records.push({
          lms_source: parts[0],
          lms_user_id: parts[1],
          google_email: parts[2],
          full_name: parts[3] || null,
          import_batch_id: batchId,
        });
      }

      if (records.length === 0) {
        throw new Error('No valid records found in CSV');
      }

      // Insert to staging table
      const { error: insertError } = await supabase
        .from('lms_identity_import')
        .insert(records);

      if (insertError) {
        throw insertError;
      }

      setMessage({
        type: 'success',
        text: `✅ Uploaded ${records.length} records. Batch ID: ${batchId.substring(0, 8)}...`,
      });

      // Reload batches
      await loadBatches();

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: `❌ Upload failed: ${error.message}`,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleApplyBatch = async (batchId: string) => {
    setApplying(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.rpc('apply_identity_import', {
        p_batch_id: batchId,
      });

      if (error) {
        throw error;
      }

      const result = data[0];
      setMessage({
        type: 'success',
        text: `✅ Applied batch: ${result.imported_count} new, ${result.updated_count} updated`,
      });

      // Reload data
      await loadBatches();
      await loadSummary();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: `❌ Apply failed: ${error.message}`,
      });
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="identity-mapping-panel" style={{ padding: '2rem' }}>
      <h2>LMS Identity Mapping</h2>
      <p style={{ color: 'var(--brand-text-muted)', marginBottom: '2rem' }}>
        Upload CSV to map LMS user IDs to Google email addresses
      </p>

      {/* Upload Section */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Upload CSV</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--brand-text-muted)', marginBottom: '1rem' }}>
          Format: <code>lms_source,lms_user_id,google_email,full_name</code>
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={uploading}
          style={{ marginBottom: '1rem' }}
        />
        {uploading && <p>Uploading...</p>}
      </div>

      {/* Message */}
      {message && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            background: message.type === 'success' ? '#d4edda' : '#f8d7da',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px',
            color: message.type === 'success' ? '#155724' : '#721c24',
          }}
        >
          {message.text}
        </div>
      )}

      {/* Pending Batches */}
      {batches.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3>Pending Batches</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Batch ID</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>LMS Source</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Records</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Imported At</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.import_batch_id} style={{ borderBottom: '1px solid var(--brand-border)' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {batch.import_batch_id.substring(0, 8)}...
                  </td>
                  <td style={{ padding: '0.75rem' }}>{batch.lms_source}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{batch.record_count}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {new Date(batch.imported_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <button
                      onClick={() => handleApplyBatch(batch.import_batch_id)}
                      disabled={applying}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--brand-info)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Apply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {summary.length > 0 && (
        <div>
          <h3>Current Mappings</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>LMS Source</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Mappings</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Unique Emails</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s) => (
                <tr key={s.lms_source} style={{ borderBottom: '1px solid var(--brand-border)' }}>
                  <td style={{ padding: '0.75rem' }}>{s.lms_source}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{s.total_mappings}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{s.unique_emails}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {new Date(s.last_updated).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {summary.length === 0 && batches.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
          <p>No identity mappings yet. Upload a CSV file to get started.</p>
        </div>
      )}
    </div>
  );
}
