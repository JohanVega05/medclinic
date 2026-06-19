'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { Appointment, PaginatedResponse } from '@/types';
import { Calendar, Clock, LogOut, Plus, Activity } from 'lucide-react';
import Link from 'next/link';

const STATUS: Record<string, string> = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  cancelled: 'badge-cancelled',
  completed: 'badge-completed',
  no_show: 'badge-no_show',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
  no_show: 'No asistió',
};

export default function PatientDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (!loading && user && user.role !== 'patient') router.push('/auth/login');
  }, [user, loading]);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', user?.id],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Appointment>>('/appointments/');
      return data.results;
    },
    enabled: !!user,
  });

  const cancelAppointment = async (id: string) => {
    if (!confirm('¿Cancelar esta cita?')) return;
    await api.post(`/appointments/${id}/cancel/`);
    window.location.reload();
  };

  if (loading || !user) return null;

  const upcoming = appointments?.filter(a => ['pending', 'confirmed'].includes(a.status)) || [];
  const past = appointments?.filter(a => ['completed', 'cancelled', 'no_show'].includes(a.status)) || [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* Navbar */}
      <nav className="navbar">
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', background: 'var(--accent)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#0a0f0d', fontWeight: 900, fontSize: '14px' }}>M</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: '16px' }}>MedClinic</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link href="/doctors" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus style={{ width: '14px', height: '14px' }} />
              Nueva cita
            </Link>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{user.full_name}</span>
            <button onClick={logout} className="btn-ghost" style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LogOut style={{ width: '13px', height: '13px' }} />
              Salir
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            Panel del paciente
          </p>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>
            Bienvenido, {user.first_name}
          </h1>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: 'Total citas', value: appointments?.length || 0, type: 'cyan' },
            { label: 'Próximas', value: upcoming.length, type: 'green' },
            { label: 'Completadas', value: past.filter(a => a.status === 'completed').length, type: 'warning' },
            { label: 'Canceladas', value: past.filter(a => a.status === 'cancelled').length, type: 'danger' },
          ].map((stat) => (
            <div key={stat.label} className={`stat-card ${stat.type}`}>
              <p style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px', color: stat.type === 'cyan' ? 'var(--accent-cyan)' : stat.type === 'green' ? 'var(--accent)' : stat.type === 'warning' ? 'var(--warning)' : 'var(--danger)' }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Próximas citas */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity style={{ width: '16px', height: '16px', color: 'var(--accent)' }} />
              <h2 style={{ fontSize: '15px', fontWeight: 700 }}>Próximas citas</h2>
            </div>
            <Link href="/doctors" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
              + Reservar
            </Link>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ height: '60px', background: 'var(--bg-primary)', borderRadius: '8px', opacity: 0.5 }} />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Calendar style={{ width: '40px', height: '40px', color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No tenés citas próximas</p>
              <Link href="/doctors" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, display: 'inline-block', marginTop: '8px' }}>
                Reservar una cita
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcoming.map((apt) => (
                <div key={apt.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '40px', height: '40px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 800, color: 'var(--accent)',
                    }}>
                      {apt.doctor_detail.user.first_name[0]}{apt.doctor_detail.user.last_name[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>
                        Dr. {apt.doctor_detail.user.full_name}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {apt.doctor_detail.specialty.name}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)', justifyContent: 'flex-end' }}>
                        <Calendar style={{ width: '11px', height: '11px' }} />
                        <span>{new Date(apt.scheduled_at).toLocaleDateString('es-CR')}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)', justifyContent: 'flex-end', marginTop: '2px' }}>
                        <Clock style={{ width: '11px', height: '11px' }} />
                        <span>{new Date(apt.scheduled_at).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <span className={`badge ${STATUS[apt.status]}`}>{STATUS_LABEL[apt.status]}</span>
                    {apt.status === 'pending' && (
                      <button
                        onClick={() => cancelAppointment(apt.id)}
                        style={{ fontSize: '12px', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historial */}
        {past.length > 0 && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <Clock style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
              <h2 style={{ fontSize: '15px', fontWeight: 700 }}>Historial</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {past.map((apt) => (
                <div key={apt.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  opacity: 0.7,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '40px', height: '40px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)',
                    }}>
                      {apt.doctor_detail.user.first_name[0]}{apt.doctor_detail.user.last_name[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>
                        Dr. {apt.doctor_detail.user.full_name}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {new Date(apt.scheduled_at).toLocaleDateString('es-CR')}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${STATUS[apt.status]}`}>{STATUS_LABEL[apt.status]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}