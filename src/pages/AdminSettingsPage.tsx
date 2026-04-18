import { useState, useEffect } from 'react';
import { getLoggedInPractitionerId } from '../hooks/usePractitioner';
import { getPractitioner, getPractitioners } from '../lib/store';
import type { Practitioner } from '../types/database';

export default function AdminSettingsPage() {
  const practitionerId = getLoggedInPractitionerId()!;
  const [practitioner, setPractitioner] = useState<Practitioner | null>(null);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const p = await getPractitioner(practitionerId);
      setPractitioner(p);
      if (p?.is_admin) {
        const list = await getPractitioners();
        setPractitioners(list);
      }
      setLoading(false);
    })();
  }, [practitionerId]);

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Settings</h2>
      </div>

      <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
        <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>Your Account</h3>
        <div style={{ fontSize: '14px', display: 'grid', gap: '8px' }}>
          <div><span style={{ color: 'var(--text-muted)' }}>Name: </span><strong>{practitioner?.full_name || practitioner?.name}</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Login Code: </span><strong>{practitioner?.login_code}</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Role: </span><strong>{practitioner?.is_admin ? 'Admin' : 'Practitioner'}</strong></div>
        </div>
      </div>

      {practitioner?.is_admin && practitioners.length > 0 && (
        <div className="card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>All Practitioners</h3>
          {practitioners.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid var(--border)',
                fontSize: '14px',
              }}
            >
              <div>
                <strong>{p.full_name || p.name}</strong>
                {p.is_admin && (
                  <span style={{ marginLeft: '8px', fontSize: '11px', background: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: '4px' }}>
                    Admin
                  </span>
                )}
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Code: {p.login_code}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
