'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { User, Doctor, Specialty, PaginatedResponse } from '@/types';
import { LogOut, Users, Stethoscope, Activity, Plus, X, Check } from 'lucide-react';

interface AdminStats {
  total_users: number;
  total_patients: number;
  total_doctors: number;
  total_specialties: number;
  total_appointments: number;
  pending_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
}

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'specialties' | 'users'>('overview');
  const [showAddSpecialty, setShowAddSpecialty] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [specialtyForm, setSpecialtyForm] = useState({ name: '', description: '' });
  const [doctorForm, setDoctorForm] = useState({
    email: '', first_name: '', last_name: '', password: 'MedClinic2024!',
    specialty_id: '', license_number: '', consultation_fee: '', years_experience: '',
  });

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (!loading && user && user.role !== 'admin') router.push('/auth/login');
  }, [user, loading]);

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await api.get<AdminStats>('/auth/stats/');
      return data;
    },
    enabled: !!user,
  });

  const { data: doctors } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Doctor>>('/doctors/admin-list/');
      return data.results;
    },
    enabled: !!user,
  });

  const { data: specialties } = useQuery({
    queryKey: ['specialties'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Specialty>>('/doctors/specialties/');
      return data.results;
    },
    enabled: !!user,
  });

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<User>>('/auth/users/');
      return data.results;
    },
    enabled: !!user,
  });

  const createSpecialty = useMutation({
    mutationFn: async () => {
      await api.post('/doctors/specialties/', specialtyForm);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialties'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setShowAddSpecialty(false);
      setSpecialtyForm({ name: '', description: '' });
    },
  });

  const deleteSpecialty = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/doctors/specialties/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialties'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const createDoctor = useMutation({
    mutationFn: async () => {
      await api.post('/doctors/create/', {
        email: doctorForm.email,
        first_name: doctorForm.first_name,
        last_name: doctorForm.last_name,
        password: doctorForm.password,
        specialty_id: doctorForm.specialty_id,
        license_number: doctorForm.license_number,
        consultation_fee: doctorForm.consultation_fee,
        years_experience: doctorForm.years_experience,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setShowAddDoctor(false);
      setDoctorForm({ email: '', first_name: '', last_name: '', password: 'MedClinic2024!', specialty_id: '', license_number: '', consultation_fee: '', years_experience: '' });
    },
  });

  if (loading || !user) return null;

  const tabs = [
    { key: 'overview', label: 'Resumen', icon: <Activity style={{ width: '14px', height: '14px' }} /> },
    { key: 'doctors', label: 'Doctores', icon: <Stethoscope style={{ width: '14px', height: '14px' }} /> },
    { key: 'specialties', label: 'Especialidades', icon: <Plus style={{ width: '14px', height: '14px' }} /> },
    { key: 'users', label: 'Usuarios', icon: <Users style={{ width: '14px', height: '14px' }} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <nav className="navbar">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', background: 'var(--accent)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#0a0f0d', fontWeight: 900, fontSize: '14px' }}>M</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: '16px' }}>MedClinic</span>
            <span style={{ fontSize: '11px', color: 'var(--accent)', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.2)', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>ADMIN</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{user.full_name}</span>
            <button onClick={logout} className="btn-ghost" style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LogOut style={{ width: '13px', height: '13px' }} />
              Salir
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <p style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Panel de administración</p>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Control del sistema</h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '32px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)', width: 'fit-content' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600,
                background: activeTab === tab.key ? 'var(--bg-card)' : 'transparent',
                color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {[
                { label: 'Usuarios totales', value: stats?.total_users || 0, type: 'cyan' },
                { label: 'Pacientes', value: stats?.total_patients || 0, type: 'green' },
                { label: 'Doctores', value: stats?.total_doctors || 0, type: 'warning' },
                { label: 'Especialidades', value: stats?.total_specialties || 0, type: 'danger' },
                { label: 'Total citas', value: stats?.total_appointments || 0, type: 'cyan' },
                { label: 'Pendientes', value: stats?.pending_appointments || 0, type: 'warning' },
                { label: 'Completadas', value: stats?.completed_appointments || 0, type: 'green' },
                { label: 'Canceladas', value: stats?.cancelled_appointments || 0, type: 'danger' },
              ].map((stat) => (
                <div key={stat.label} className={`stat-card ${stat.type}`}>
                  <p style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px', color: stat.type === 'cyan' ? 'var(--accent-cyan)' : stat.type === 'green' ? 'var(--accent)' : stat.type === 'warning' ? 'var(--warning)' : 'var(--danger)' }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specialties */}
        {activeTab === 'specialties' && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700 }}>Especialidades</h2>
              <button onClick={() => setShowAddSpecialty(!showAddSpecialty)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus style={{ width: '13px', height: '13px' }} />
                Nueva especialidad
              </button>
            </div>

            {showAddSpecialty && (
              <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--accent)' }}>Nueva especialidad</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label className="label">Nombre</label>
                    <input className="input" placeholder="Ej: Neurología" value={specialtyForm.name} onChange={(e) => setSpecialtyForm({ ...specialtyForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Descripción</label>
                    <input className="input" placeholder="Descripción de la especialidad" value={specialtyForm.description} onChange={(e) => setSpecialtyForm({ ...specialtyForm, description: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => createSpecialty.mutate()} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                      Guardar
                    </button>
                    <button onClick={() => setShowAddSpecialty(false)} className="btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {specialties?.map((s) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '14px' }}>{s.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: s.is_active ? 'var(--accent)' : 'var(--danger)', background: s.is_active ? 'rgba(0,255,135,0.1)' : 'rgba(255,71,87,0.1)', padding: '3px 8px', borderRadius: '999px', fontWeight: 700 }}>
                      {s.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                    <button
                      onClick={() => { if (confirm('¿Eliminar esta especialidad?')) deleteSpecialty.mutate(s.id); }}
                      style={{ width: '28px', height: '28px', background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}
                    >
                      <X style={{ width: '12px', height: '12px' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Doctors */}
        {activeTab === 'doctors' && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700 }}>Doctores</h2>
              <button onClick={() => setShowAddDoctor(!showAddDoctor)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus style={{ width: '13px', height: '13px' }} />
                Nuevo doctor
              </button>
            </div>

            {showAddDoctor && (
              <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--accent)' }}>Nuevo doctor</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="label">Nombre</label>
                    <input className="input" placeholder="Nombre" value={doctorForm.first_name} onChange={(e) => setDoctorForm({ ...doctorForm, first_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Apellido</label>
                    <input className="input" placeholder="Apellido" value={doctorForm.last_name} onChange={(e) => setDoctorForm({ ...doctorForm, last_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input className="input" type="email" placeholder="doctor@email.com" value={doctorForm.email} onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Especialidad</label>
                    <select className="input" value={doctorForm.specialty_id} onChange={(e) => setDoctorForm({ ...doctorForm, specialty_id: e.target.value })}>
                      <option value="">Seleccioná una especialidad</option>
                      {specialties?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Número de licencia</label>
                    <input className="input" placeholder="MED-001" value={doctorForm.license_number} onChange={(e) => setDoctorForm({ ...doctorForm, license_number: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Tarifa de consulta (₡)</label>
                    <input className="input" type="number" placeholder="50000" value={doctorForm.consultation_fee} onChange={(e) => setDoctorForm({ ...doctorForm, consultation_fee: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Años de experiencia</label>
                    <input className="input" type="number" placeholder="5" value={doctorForm.years_experience} onChange={(e) => setDoctorForm({ ...doctorForm, years_experience: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button onClick={() => createDoctor.mutate()} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    {createDoctor.isPending ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button onClick={() => setShowAddDoctor(false)} className="btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {doctors?.map((doctor) => (
                <div key={doctor.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: 'var(--accent)' }}>
                      {doctor.user.first_name[0]}{doctor.user.last_name[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '14px' }}>Dr. {doctor.user.full_name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>{doctor.specialty.name}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700 }}>₡{Number(doctor.consultation_fee).toLocaleString()}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{doctor.years_experience} años exp.</span>
                    <span style={{ fontSize: '11px', color: doctor.is_available ? 'var(--accent)' : 'var(--danger)', background: doctor.is_available ? 'rgba(0,255,135,0.1)' : 'rgba(255,71,87,0.1)', padding: '3px 8px', borderRadius: '999px', fontWeight: 700 }}>
                      {doctor.is_available ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div className="card">
            <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '24px' }}>Usuarios registrados</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {users?.map((u) => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)' }}>
                      {u.first_name[0]}{u.last_name[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '14px' }}>{u.full_name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{u.email}</p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px',
                    color: u.role === 'admin' ? 'var(--accent)' : u.role === 'doctor' ? 'var(--accent-cyan)' : 'var(--warning)',
                    background: u.role === 'admin' ? 'rgba(0,255,135,0.1)' : u.role === 'doctor' ? 'rgba(0,229,255,0.1)' : 'rgba(255,165,2,0.1)',
                  }}>
                    {u.role.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}