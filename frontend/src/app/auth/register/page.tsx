'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  first_name: z.string().min(2, 'Mínimo 2 caracteres'),
  last_name: z.string().min(2, 'Mínimo 2 caracteres'),
  phone: z.string().min(8, 'Teléfono inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  password2: z.string(),
}).refine((data) => data.password === data.password2, {
  message: 'Las contraseñas no coinciden',
  path: ['password2'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register/', { ...data, role: 'patient' });
      router.push('/auth/login?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.email?.[0] || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '24px',
          }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'var(--accent)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#0a0f0d', fontWeight: 900, fontSize: '16px' }}>M</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: '18px' }}>MedClinic</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>Crear cuenta</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Registrate como paciente</p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label">Nombre</label>
                <input {...register('first_name')} className="input" placeholder="Juan" />
                {errors.first_name && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="label">Apellido</label>
                <input {...register('last_name')} className="input" placeholder="Pérez" />
                {errors.last_name && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>{errors.last_name.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" className="input" placeholder="tu@email.com" />
              {errors.email && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Teléfono</label>
              <input {...register('phone')} className="input" placeholder="88888888" />
              {errors.phone && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>{errors.phone.message}</p>}
            </div>

            <div>
              <label className="label">Contraseña</label>
              <input {...register('password')} type="password" className="input" placeholder="Mínimo 8 caracteres" />
              {errors.password && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Repetir contraseña</label>
              <input {...register('password2')} type="password" className="input" placeholder="••••••••" />
              {errors.password2 && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>{errors.password2.message}</p>}
            </div>

            {error && (
              <div style={{
                background: 'rgba(255,71,87,0.1)',
                border: '1px solid rgba(255,71,87,0.2)',
                color: 'var(--danger)',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '4px' }}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', marginTop: '24px' }}>
          Ya tenés cuenta?{' '}
          <Link href="/auth/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}