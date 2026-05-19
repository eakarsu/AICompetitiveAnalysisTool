import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const EMPTY = { name: '', competitor: '', signal_type: 'price_change', threshold: '', action: 'notify_sales', enabled: true, notes: '' };

export default function TrackedRulesEditor() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true); setErr('');
    try {
      const r = await api.get('/custom-views/tracked-rules');
      setRules(r.data.rules || []);
    } catch (e) { setErr(e.response?.data?.error || e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setErr('');
    try {
      if (editId) await api.put(`/custom-views/tracked-rules/${editId}`, form);
      else await api.post('/custom-views/tracked-rules', form);
      setForm(EMPTY); setEditId(null); load();
    } catch (e) { setErr(e.response?.data?.error || e.message); }
  };
  const edit = (r) => { setForm({ ...EMPTY, ...r }); setEditId(r.id); };
  const del = async (id) => {
    if (!window.confirm('Delete rule?')) return;
    try { await api.delete(`/custom-views/tracked-rules/${id}`); load(); }
    catch (e) { setErr(e.response?.data?.error || e.message); }
  };

  const s = {
    card: { background: '#16213e', border: '1px solid #0f3460', borderRadius: 12, padding: 20, marginBottom: 20 },
    title: { color: '#e94560', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 8 },
    input: { padding: '7px 10px', borderRadius: 6, border: '1px solid #0f3460', background: '#0a0a1a', color: '#e0e0e0', fontSize: 13 },
    row: { display: 'flex', gap: 8 },
    btn: { padding: '7px 14px', borderRadius: 6, border: 'none', background: '#e94560', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
    btnAlt: { padding: '6px 10px', borderRadius: 6, border: '1px solid #0f3460', background: 'transparent', color: '#e0e0e0', cursor: 'pointer', fontSize: 12 },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: 12 },
    th: { background: '#0f3460', color: '#e0e0e0', padding: '8px 10px', fontSize: 12, textAlign: 'left' },
    td: { padding: '8px 10px', borderBottom: '1px solid #0f3460', color: '#e0e0e0', fontSize: 12 },
  };

  return (
    <div style={s.card} data-testid="tracked-rules-editor">
      <div style={s.title}>Tracked Competitor Rules</div>
      <div style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>Rules trigger when competitor signals match the configured threshold.</div>
      <div style={s.grid}>
        <input style={s.input} placeholder="Rule name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input style={s.input} placeholder="Competitor" value={form.competitor} onChange={e => setForm({ ...form, competitor: e.target.value })} />
        <select style={s.input} value={form.signal_type} onChange={e => setForm({ ...form, signal_type: e.target.value })}>
          <option value="price_change">price_change</option>
          <option value="launch">launch</option>
          <option value="funding">funding</option>
          <option value="hiring">hiring</option>
          <option value="reviews">reviews</option>
        </select>
        <input style={s.input} placeholder="Threshold" value={form.threshold || ''} onChange={e => setForm({ ...form, threshold: e.target.value })} />
        <input style={s.input} placeholder="Action" value={form.action || ''} onChange={e => setForm({ ...form, action: e.target.value })} />
        <label style={{ color: '#e0e0e0', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={!!form.enabled} onChange={e => setForm({ ...form, enabled: e.target.checked })} />
          Enabled
        </label>
      </div>
      <input style={{ ...s.input, width: '100%', marginBottom: 8 }} placeholder="Notes" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
      <div style={s.row}>
        <button style={s.btn} onClick={save}>{editId ? 'Update Rule' : 'Add Rule'}</button>
        {editId && <button style={s.btnAlt} onClick={() => { setForm(EMPTY); setEditId(null); }}>Cancel</button>}
      </div>
      {err && <div style={{ color: '#e94560', fontSize: 12, marginTop: 8 }}>{err}</div>}
      {loading ? (
        <div style={{ color: '#888', marginTop: 12 }}>Loading...</div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Name</th><th style={s.th}>Competitor</th><th style={s.th}>Signal</th>
              <th style={s.th}>Threshold</th><th style={s.th}>Action</th><th style={s.th}>Enabled</th><th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id}>
                <td style={s.td}>{r.name}</td>
                <td style={s.td}>{r.competitor}</td>
                <td style={s.td}>{r.signal_type}</td>
                <td style={s.td}>{r.threshold || '-'}</td>
                <td style={s.td}>{r.action || '-'}</td>
                <td style={s.td}>{r.enabled ? 'YES' : 'no'}</td>
                <td style={s.td}>
                  <button style={s.btnAlt} onClick={() => edit(r)}>Edit</button>{' '}
                  <button style={s.btnAlt} onClick={() => del(r.id)}>Del</button>
                </td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr><td style={s.td} colSpan={7}>No rules yet.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
