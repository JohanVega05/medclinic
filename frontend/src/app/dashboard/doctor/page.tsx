'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { Appointment, PaginatedResponse } from '@/types';
import { Calendar, Clock, LogOut, Check, X, Activity } from 'lucide-react';

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

export default function DoctorDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (!loading && user && user.role !== 'doctor') router.push('/auth/login');
  }, [user, loading]);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['doctor-appointments'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Appointment>>('/appointments/');
      return data.results;
    },
    enabled: !!user,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/appointments/${id}/`, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] }),
  });

  if (loading || !user) return null;

  const today = new Date().toDateString();
  const todayApts = appointments?.filter(a => new Date(a.scheduled_at).toDateString() === today) || [];
  const pending = appointments?.filter(a => a.status === 'pending') || [];

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
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Dr. {user.full_name}</span>
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
            Panel del doctor
          </p>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>
            Dr. {user.first_name} {user.last_name}
          </h1>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: 'Citas hoy', value: todayApts.length, type: 'cyan' },
            { label: 'Pendientes', value: pending.length, type: 'warning' },
            { label: 'Total citas', value: appointments?.length || 0, type: 'green' },
            { label: 'Completadas', value: appointments?.filter(a => a.status === 'completed').length || 0, type: 'danger' },
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

        {/* Citas de hoy */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Activity style={{ width: '16px', height: '16px', color: 'var(--accent)' }} />
            <h2 style={{ fontSize: '15px', fontWeight: 700 }}>Citas de hoy</h2>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ height: '60px', background: 'var(--bg-primary)', borderRadius: '8px', opacity: 0.5 }} />
              ))}
            </div>
          ) : todayApts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Calendar style={{ width: '40px', height: '40px', color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No tenés citas para hoy</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {todayApts.map((apt) => (
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
                      fontSize: '13px', fontWeight: 800, color: 'var(--accent-cyan)',
                    }}>
                      {apt.patient_detail.first_name[0]}{apt.patient_detail.last_name[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{apt.patient_detail.full_name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{apt.reason || 'Sin motivo especificado'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <Clock style={{ width: '11px', height: '11px' }} />
                      <span>{new Date(apt.scheduled_at).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span className={`badge ${STATUS[apt.status]}`}>{STATUS_LABEL[apt.status]}</span>
                    {apt.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => updateStatus.mutate({ id: apt.id, status: 'confirmed' })}
                          style={{ width: '30px', height: '30px', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.2)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}
                        >
                          <Check style={{ width: '13px', height: '13px' }} />
                        </button>
                        <button
                          onClick={() => updateStatus.mutate({ id: apt.id, status: 'cancelled' })}
                          style={{ width: '30px', height: '30px', background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}
                        >
                          <X style={{ width: '13px', height: '13px' }} />
                        </button>
                      </div>
                    )}
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => updateStatus.mutate({ id: apt.id, status: 'completed' })}
                        style={{ padding: '6px 12px', background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 600 }}
                      >
                        Completar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Todas las citas */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Clock style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
            <h2 style={{ fontSize: '15px', fontWeight: 700 }}>Todas las citas</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {appointments?.map((apt) => (
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
                    fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)',
                  }}>
                    {apt.patient_detail.first_name[0]}{apt.patient_detail.last_name[0]}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{apt.patient_detail.full_name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <Calendar style={{ width: '11px', height: '11px' }} />
                      <span>{new Date(apt.scheduled_at).toLocaleDateString('es-CR')}</span>
                      <Clock style={{ width: '11px', height: '11px' }} />
                      <span>{new Date(apt.scheduled_at).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                <span className={`badge ${STATUS[apt.status]}`}>{STATUS_LABEL[apt.status]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}