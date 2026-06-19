'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Doctor, Specialty, PaginatedResponse } from '@/types';
import Link from 'next/link';
import { Search, Star, Clock } from 'lucide-react';

export default function DoctorsPage() {
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardLink, setDashboardLink] = useState('/auth/login');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    if (token) {
      setIsLoggedIn(true);
      if (role === 'doctor') setDashboardLink('/dashboard/doctor');
      else if (role === 'admin') setDashboardLink('/dashboard/admin');
      else setDashboardLink('/dashboard/patient');
    }
  }, []);

  const { data: specialties } = useQuery({
    queryKey: ['specialties'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Specialty>>('/doctors/specialties/');
      return data.results;
    },
    enabled: true,
  });

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors', search, specialty],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (specialty) params.append('specialty', specialty);
      const { data } = await api.get<PaginatedResponse<Doctor>>(`/doctors/?${params}`);
      return data.results;
    },
    enabled: true,
  });

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px' }}>
              Inicio
            </Link>
            {isLoggedIn ? (
              <Link href={dashboardLink} className="btn-primary" style={{ textDecoration: 'none', fontSize: '13px', padding: '8px 16px' }}>
                Mi dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost" style={{ textDecoration: 'none', fontSize: '13px' }}>
                  Iniciar sesión
                </Link>
                <Link href="/auth/register" className="btn-primary" style={{ textDecoration: 'none', fontSize: '13px', padding: '8px 16px' }}>
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '48px 24px',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
            Directorio médico
          </p>
          <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>
            Encontrá tu especialista
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '32px' }}>
            Buscá por nombre o especialidad y reservá tu cita
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <Search style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)',
                width: '16px', height: '16px',
                color: 'var(--text-muted)',
              }} />
              <input
                type="text"
                placeholder="Buscar doctor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input"
                style={{ paddingLeft: '42px' }}
              />
            </div>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="input"
              style={{ minWidth: '200px', flex: '0 0 auto', cursor: 'pointer' }}
            >
              <option value="">Todas las especialidades</option>
              {specialties?.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card" style={{ height: '180px', opacity: 0.5 }} />
            ))}
          </div>
        ) : doctors?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '18px' }}>No se encontraron doctores</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {doctors?.map((doctor) => (
              <div key={doctor.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', transition: 'all 0.2s' }}>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '52px', height: '52px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '16px', fontWeight: 800,
                    color: 'var(--accent)',
                  }}>
                    {doctor.user.first_name[0]}{doctor.user.last_name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>
                      Dr. {doctor.user.full_name}
                    </p>
                    <p style={{ color: 'var(--accent-cyan)', fontSize: '13px', fontWeight: 600 }}>
                      {doctor.specialty.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <Star style={{ width: '12px', height: '12px', color: '#ffa502', fill: '#ffa502' }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {doctor.average_rating || 'Sin reseñas'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ height: '1px', background: 'var(--border)' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock style={{ width: '13px', height: '13px' }} />
                    <span>{doctor.years_experience} años exp.</span>
                  </div>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                    ₡{Number(doctor.consultation_fee).toLocaleString()}
                  </span>
                </div>

                <Link
                  href={`/doctors/${doctor.id}`}
                  className="btn-primary"
                  style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '10px' }}
                >
                  Ver perfil y reservar
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}