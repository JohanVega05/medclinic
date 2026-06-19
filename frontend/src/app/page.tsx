'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Clock, Star } from 'lucide-react';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardLink, setDashboardLink] = useState('/dashboard/patient');

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
            <Link href="/doctors" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px' }}>
              Doctores
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

      {/* Hero */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '100px 24px 80px' }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,255,135,0.08)',
            border: '1px solid rgba(0,255,135,0.2)',
            borderRadius: '999px',
            padding: '6px 14px',
            marginBottom: '32px',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
            <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}>Sistema de gestión médica</span>
          </div>

          <h1 style={{ fontSize: '56px', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px' }}>
            Salud digital.<br />
            <span style={{ color: 'var(--accent)' }}>Sin filas.</span><br />
            Sin esperas.
          </h1>

          <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '40px', maxWidth: '520px' }}>
            Reservá citas con especialistas, accedé a tu historial médico y gestioná tu salud desde un solo lugar.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {isLoggedIn ? (
              <Link href={dashboardLink} className="btn-primary" style={{ textDecoration: 'none', fontSize: '15px', padding: '13px 28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Ir a mi dashboard
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
            ) : (
              <Link href="/auth/register" className="btn-primary" style={{ textDecoration: 'none', fontSize: '15px', padding: '13px 28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Comenzar ahora
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
            )}
            <Link href="/doctors" className="btn-ghost" style={{ textDecoration: 'none', fontSize: '15px', padding: '13px 28px' }}>
              Ver doctores
            </Link>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ height: '1px', background: 'var(--border)' }} />
      </div>

      {/* Features */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px' }}>
        <p style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
          Por qué MedClinic
        </p>
        <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '48px' }}>
          Todo lo que necesitás,<br />en un solo lugar
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {[
            {
              icon: <Clock style={{ width: '20px', height: '20px' }} />,
              color: 'var(--accent)',
              title: 'Reserva en minutos',
              desc: 'Buscá tu especialista, elegí el horario y confirmá tu cita sin llamadas ni esperas.',
            },
            {
              icon: <Shield style={{ width: '20px', height: '20px' }} />,
              color: 'var(--accent-cyan)',
              title: 'Historial centralizado',
              desc: 'Todos tus diagnósticos, recetas y archivos médicos en un lugar seguro y accesible.',
            },
            {
              icon: <Star style={{ width: '20px', height: '20px' }} />,
              color: '#ffa502',
              title: 'Especialistas verificados',
              desc: 'Todos los médicos en la plataforma están verificados y calificados por pacientes reales.',
            },
          ].map((feature) => (
            <div key={feature.title} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                width: '44px', height: '44px',
                background: `${feature.color}15`,
                border: `1px solid ${feature.color}30`,
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: feature.color,
              }}>
                {feature.icon}
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div className="card" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '24px',
          borderColor: 'rgba(0,255,135,0.2)',
          background: 'rgba(0,255,135,0.03)',
        }}>
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
              Listo para empezar?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Reservá tu primera cita hoy.
            </p>
          </div>
          <Link href="/doctors" className="btn-primary" style={{ textDecoration: 'none', fontSize: '14px', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
            Ver especialistas
            <ArrowRight style={{ width: '15px', height: '15px' }} />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          MedClinic — Sistema de gestión de citas médicas
        </p>
      </div>
    </div>
  );
}