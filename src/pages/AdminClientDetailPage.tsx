import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClient, getCheckIns, getPractitioner } from '../lib/store';
import type { Client, CheckIn } from '../types/database';
import { formatDate, timeAgo, feelingEmoji, painColor, changeLabel, changeColor } from '../lib/utils';
import { ChevronLeft, AlertTriangle, Pill, MessageSquare } from 'lucide-react';
import MiniChart from '../components/MiniChart';

export default function AdminClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;
    (async () => {
      const [c, cis] = await Promise.all([getClient(clientId), getCheckIns(clientId)]);
      setClient(c);
      setCheckIns(cis);
      setLoading(false);
    })();
  }, [clientId]);

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!client) return <div className="page-loading">Client not found.</div>;

  const painData = [...checkIns].reverse().map((c) => c.pain_level);

  return (
    <div className="admin-page">
      <div className="page-header" style={{ marginBottom: '4px' }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: '8px' }} onClick={() => navigate('/admin/dashboard')}>
          <ChevronLeft size={16} /> Back
        </button>
        <h2>{client.full_name}</h2>
        <p>{client.primary_complaint}</p>
      </div>

      <div className="card" style={{ marginBottom: '16px', padding: '14px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
          <div><span style={{ color: 'var(--text-muted)' }}>Login code</span><br /><strong>{client.login_code}</strong></div>
          {client.next_appointment && (
            <div><span style={{ color: 'var(--text-muted)' }}>Next appt</span><br /><strong>{formatDate(client.next_appointment)}</strong></div>
          )}
          {client.tracking_duration_weeks && (
            <div><span style={{ color: 'var(--text-muted)' }}>Tracking</span><br /><strong>{client.tracking_duration_weeks} weeks</strong></div>
          )}
          {client.email && (
            <div><span style={{ color: 'var(--text-muted)' }}>Email</span><br /><strong>{client.email}</strong></div>
          )}
        </div>
        {client.notes && (
          <p style={{ fontSize: '13px', marginTop: '10px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            {client.notes}
          </p>
        )}
      </div>

      {painData.length > 1 && (
        <div className="card chart-card" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '13px', marginBottom: '8px' }}>Pain Trend</h3>
          <MiniChart data={painData} label="" />
        </div>
      )}

      <div className="page-header">
        <h3 style={{ fontSize: '15px' }}>Check-ins ({checkIns.length})</h3>
      </div>

      <div className="timeline-list">
        {checkIns.length === 0 && (
          <div className="empty-state"><p>No check-ins yet.</p></div>
        )}
        {checkIns.map((ci) => {
          const expanded = expandedId === ci.id;
          return (
            <div
              key={ci.id}
              className={`timeline-entry ${ci.flagged ? 'flagged' : ''} ${expanded ? 'expanded' : ''}`}
              onClick={() => setExpandedId(expanded ? null : ci.id)}
            >
              <div className="timeline-entry-header">
                <div className="entry-date">
                  <strong>{formatDate(ci.created_at)}</strong>
                  <span className="entry-time">{timeAgo(ci.created_at)}</span>
                </div>
                <div className="entry-badges">
                  {ci.flagged && <AlertTriangle size={16} color="#f59e0b" />}
                  <span className="feeling-badge">{feelingEmoji(ci.overall_feeling)}</span>
                  <span className="change-badge" style={{ color: changeColor(ci.symptom_change) }}>
                    {changeLabel(ci.symptom_change)}
                  </span>
                </div>
              </div>
              <div className="entry-metrics">
                <div className="metric">
                  <span className="metric-label">Pain</span>
                  <span className="metric-value" style={{ color: painColor(ci.pain_level) }}>{ci.pain_level}/10</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Sleep</span>
                  <span className="metric-value">{ci.sleep_quality}/5</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Stress</span>
                  <span className="metric-value">{ci.stress_level}/5</span>
                </div>
              </div>
              {expanded && (
                <div className="entry-details">
                  {ci.medication_taken && (
                    <div className="detail-row"><Pill size={14} /> Medication taken</div>
                  )}
                  {ci.notes && (
                    <div className="detail-row notes-row">
                      <MessageSquare size={14} /><span>{ci.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
