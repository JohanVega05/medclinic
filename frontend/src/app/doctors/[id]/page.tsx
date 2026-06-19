'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/axios';
import { Doctor } from '@/types';
import { Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const bookSchema = z.object({
  scheduled_at: z.string().min(1, 'Seleccioná una fecha y hora'),
  reason: z.string().min(5, 'Describí el motivo de la consulta'),
});

type BookForm = z.infer<typeof bookSchema>;

export default function BookAppointmentPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: doctor, isLoading } = useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => {
      const { data } = await api.get<Doctor>(`/doctors/${id}/`);
      return data;
    },
    enabled: !!id,  
  });

  const { register, handleSubmit, formState: { errors } } = useForm<BookForm>({
    resolver: zodResolver(bookSchema),
  });

  const onSubmit = async (data: BookForm) => {
    setLoading(true);
    setError('');
    try {
      const scheduled_at = new Date(data.scheduled_at).toISOString();
      await api.post('/appointments/', {
        doctor: id,
        scheduled_at,
        reason: data.reason,
      });
      router.push('/dashboard/patient?booked=true');
    } catch (err: any) {
      setError(err.response?.data?.scheduled_at?.[0] || 'Error al reservar la cita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <nav className="navbar">
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', background: 'var(--accent)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#0a0f0d', fontWeight: 900, fontSize: '14px' }}>M</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: '16px' }}>MedClinic</span>
          </div>
          <button
            onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}
            >
            <ArrowLeft style={{ width: '14px', height: '14px' }} />
            Volver al perfil
            </button>
        </div>
      </nav>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <p style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            Nueva cita
          </p>
          <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>Reservar consulta</h1>
          {doctor && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Con Dr. {doctor.user.full_name} — {doctor.specialty.name}
            </p>
          )}
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div>
              <label className="label">
                Fecha y hora
              </label>
              <input
                {...register('scheduled_at')}
                type="datetime-local"
                className="input"
              />
              {errors.scheduled_at && (
                <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '6px' }}>{errors.scheduled_at.message}</p>
              )}
            </div>

            <div>
              <label className="label">Motivo de la consulta</label>
              <textarea
                {...register('reason')}
                rows={4}
                className="input"
                style={{ resize: 'none', height: 'auto' }}
                placeholder="Describí brevemente el motivo de tu consulta..."
              />
              {errors.reason && (
                <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '6px' }}>{errors.reason.message}</p>
              )}
            </div>

            {doctor && (
              <div style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Costo de la consulta</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent)' }}>
                  ₡{Number(doctor.consultation_fee).toLocaleString()}
                </span>
              </div>
            )}

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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Calendar style={{ width: '15px', height: '15px' }} />
              {loading ? 'Reservando...' : 'Confirmar reserva'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}