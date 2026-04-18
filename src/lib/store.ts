import { supabase } from './supabase';
import type {
  Client,
  Practitioner,
  CheckIn,
  Symptom,
  SymptomEntry,
  ContactRequest,
  FollowUpReport,
  SymptomChange,
} from '../types/database';

export function getPractitionerDisplayName(p: Practitioner): string {
  return p.full_name || p.name;
}

export async function getPractitionerByCode(code: string): Promise<Practitioner | null> {
  const { data } = await supabase
    .from('practitioners')
    .select('*')
    .eq('login_code', code.trim())
    .maybeSingle();
  return data ?? null;
}

export async function getClientByCode(code: string): Promise<Client | null> {
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('login_code', code.trim())
    .maybeSingle();
  return data ?? null;
}

export async function getClient(clientId: string): Promise<Client | null> {
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .maybeSingle();
  return data ?? null;
}

export async function getPractitioner(practitionerId: string): Promise<Practitioner | null> {
  const { data } = await supabase
    .from('practitioners')
    .select('*')
    .eq('id', practitionerId)
    .maybeSingle();
  return data ?? null;
}

export async function getPractitioners(): Promise<Practitioner[]> {
  const { data } = await supabase
    .from('practitioners')
    .select('*')
    .order('name');
  return data ?? [];
}

export async function getClients(practitionerId?: string): Promise<Client[]> {
  let query = supabase.from('clients').select('*').order('full_name');
  if (practitionerId) {
    query = query.eq('practitioner_id', practitionerId);
  }
  const { data } = await query;
  return data ?? [];
}

export async function updateClient(
  clientId: string,
  updates: Partial<Client>
): Promise<Client | null> {
  const { data } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', clientId)
    .select()
    .maybeSingle();
  return data ?? null;
}

export async function createClient(payload: {
  full_name: string;
  email: string;
  practitioner_id: string;
  login_code: string;
  primary_complaint: string;
  notes?: string;
  next_appointment?: string;
  tracking_duration_weeks?: number;
  tracking_end_date?: string;
}): Promise<Client | null> {
  const { data } = await supabase
    .from('clients')
    .insert(payload)
    .select()
    .maybeSingle();
  return data ?? null;
}

export async function deleteClient(clientId: string): Promise<void> {
  await supabase.from('clients').delete().eq('id', clientId);
}

export async function getCheckIns(clientId: string): Promise<CheckIn[]> {
  const { data } = await supabase
    .from('check_ins')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function createCheckIn(payload: {
  client_id: string;
  overall_feeling: number;
  symptom_change: string;
  pain_level: number;
  sleep_quality: number;
  stress_level: number;
  medication_taken: boolean;
  notes?: string;
  flagged?: boolean;
}): Promise<CheckIn | null> {
  const { data } = await supabase
    .from('check_ins')
    .insert({ ...payload, flagged: payload.flagged ?? false })
    .select()
    .maybeSingle();
  return data ?? null;
}

export async function getSymptoms(clientId: string): Promise<Symptom[]> {
  const { data } = await supabase
    .from('symptoms')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at');
  return data ?? [];
}

export async function createSymptom(payload: {
  client_id: string;
  name: string;
  body_area: string;
}): Promise<Symptom | null> {
  const { data } = await supabase
    .from('symptoms')
    .insert({ ...payload, active: true })
    .select()
    .maybeSingle();
  return data ?? null;
}

export async function updateSymptom(
  symptomId: string,
  updates: Partial<Symptom>
): Promise<void> {
  await supabase.from('symptoms').update(updates).eq('id', symptomId);
}

export async function getSymptomEntriesBySymptom(symptomId: string): Promise<SymptomEntry[]> {
  const { data } = await supabase
    .from('symptom_entries')
    .select('*')
    .eq('symptom_id', symptomId)
    .order('id');
  return data ?? [];
}

export async function createSymptomEntry(payload: {
  check_in_id: string;
  symptom_id: string;
  severity: number;
  notes?: string;
}): Promise<void> {
  await supabase.from('symptom_entries').insert(payload);
}

export async function storeSymptomQuery(
  clientId: string,
  symptomDescription: string,
  redFlagDetected: boolean,
  confidenceScore: number
): Promise<void> {
  await supabase.from('symptom_queries').insert({
    client_id: clientId,
    symptom_description: symptomDescription,
    red_flag_detected: redFlagDetected,
    confidence_score: confidenceScore,
  });
}

export async function createContactRequest(
  clientId: string,
  practitionerId: string,
  symptomDescription: string,
  symptomScore: number
): Promise<void> {
  await supabase.from('contact_requests').insert({
    client_id: clientId,
    practitioner_id: practitionerId,
    symptom_description: symptomDescription,
    symptom_score: symptomScore,
    is_read: false,
  });
}

export async function getContactRequests(practitionerId: string): Promise<ContactRequest[]> {
  const { data } = await supabase
    .from('contact_requests')
    .select('*, clients(full_name, primary_complaint)')
    .eq('practitioner_id', practitionerId)
    .order('created_at', { ascending: false });
  return (data as ContactRequest[]) ?? [];
}

export async function getAllContactRequests(): Promise<ContactRequest[]> {
  const { data } = await supabase
    .from('contact_requests')
    .select('*, clients(full_name, primary_complaint)')
    .order('created_at', { ascending: false });
  return (data as ContactRequest[]) ?? [];
}

export async function markContactRequestRead(requestId: string): Promise<void> {
  await supabase
    .from('contact_requests')
    .update({ is_read: true, responded_at: new Date().toISOString() })
    .eq('id', requestId);
}

export async function generateReport(clientId: string): Promise<FollowUpReport | null> {
  const checkIns = await getCheckIns(clientId);
  if (checkIns.length === 0) return null;

  const sorted = [...checkIns].reverse();
  const total = sorted.length;

  const avgPain = sorted.reduce((s, c) => s + c.pain_level, 0) / total;
  const avgSleep = sorted.reduce((s, c) => s + c.sleep_quality, 0) / total;
  const avgStress = sorted.reduce((s, c) => s + c.stress_level, 0) / total;
  const painTrend = sorted.map((c) => c.pain_level);

  let overallTrend: 'improving' | 'declining' | 'stable' = 'stable';
  if (total >= 3) {
    const first = painTrend.slice(0, Math.floor(total / 2));
    const last = painTrend.slice(Math.ceil(total / 2));
    const firstAvg = first.reduce((a, b) => a + b, 0) / first.length;
    const lastAvg = last.reduce((a, b) => a + b, 0) / last.length;
    if (lastAvg < firstAvg - 0.5) overallTrend = 'improving';
    else if (lastAvg > firstAvg + 0.5) overallTrend = 'declining';
  }

  const symptoms = await getSymptoms(clientId);
  const symptomChanges: SymptomChange[] = [];
  for (const sym of symptoms.filter((s) => s.active)) {
    const entries = await getSymptomEntriesBySymptom(sym.id);
    if (entries.length >= 2) {
      const start = entries[0].severity;
      const end = entries[entries.length - 1].severity;
      const trend: 'improving' | 'declining' | 'stable' =
        end < start - 0.5 ? 'improving' : end > start + 0.5 ? 'declining' : 'stable';
      symptomChanges.push({ symptom_name: sym.name, start_severity: start, end_severity: end, trend });
    }
  }

  return {
    total_check_ins: total,
    compliance_rate: Math.min(100, Math.round((total / 30) * 100)),
    summary: {
      overall_trend: overallTrend,
      avg_pain_level: Math.round(avgPain * 10) / 10,
      avg_sleep_quality: Math.round(avgSleep * 10) / 10,
      avg_stress_level: Math.round(avgStress * 10) / 10,
      pain_trend: painTrend,
      symptom_changes: symptomChanges,
    },
  };
}
