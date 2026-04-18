import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLoggedInPractitionerId } from '../hooks/usePractitioner';
import { getPractitioner, getClients, getPractitioners } from '../lib/store';
import type { Client, Practitioner } from '../types/database';
import { formatDate } from '../lib/utils';
import { ChevronRight } from 'lucide-react';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const practitionerId = getLoggedInPractitionerId()!;
  const [practitioner, setPractitioner] = useState<Practitioner | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const p = await getPractitioner(practitionerId);
      setPractitioner(p);
      let list: Client[];
      if (p?.is_admin) {
        list = await getClients();
        const practitioners = await getPractitioners();
        const pMap: Record<string, string> = {};
        practitioners.forEach((pr) => { pMap[pr.id] = pr.full_name || pr.name; });
        (list as any[]).forEach((c) => { c._practitionerName = pMap[c.practitioner_id ?? ''] ?? '\u2014'; });
      } else {
        list = await getClients(practitionerId);
      }
      setClients(list);
      setLoading(false);
    })();
  }, [practitionerId]);

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>{practitioner?.is_admin ? 'All Clients' : 'My Clients'}</h2>
        <p>{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
      </div>

      {clients.length === 0 ? (
        <div className="empty-state">
          <p>No clients assigned yet.</p>
          <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/admin/add-client')}>
            Add a Client
          </button>
        </div>
      ) : (
        <div className="client-list">
          {clients.map((client) => (
            <div
              key={client.id}
              className="client-card card"
              onClick={() => navigate(`/admin/client/${client.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="client-card-header">
                <div>
                  <h3 className="client-name">{client.full_name}</h3>
                  {(client as any)._practitionerName && (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {(client as any)._practitionerName}
                    </p>
                  )}
                  <p className="client-complaint">{client.primary_complaint}</p>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </div>
              <div className="client-meta">
                <span>Code: <strong>{client.login_code}</strong></span>
                {client.next_appointment && (
                  <span>Next: {formatDate(client.next_appointment)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
