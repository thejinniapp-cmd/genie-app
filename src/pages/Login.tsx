import { useState } from 'react';
import { signInWithGoogle, signInWithEmail } from '../lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGoogle() {
    setError('');
    try {
      await signInWithGoogle();
    } catch (e: any) {
      setError(e.message || 'Error al iniciar sesión con Google');
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      await signInWithEmail(email.trim());
      setSent(true);
    } catch (e: any) {
      setError(e.message || 'Error al enviar el enlace');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-4xl font-bold text-white mb-2 tracking-tight">✦ Genie</div>
          <p className="text-[#555] text-sm">El equipo de IA para tu empresa</p>
        </div>

        <div className="bg-[#141414] border border-[#1f1f1f] rounded-2xl p-8 space-y-5">
          {sent ? (
            <div className="text-center py-4 space-y-3">
              <div className="text-4xl">📬</div>
              <p className="text-white font-medium">Revisa tu correo</p>
              <p className="text-[#666] text-sm">
                Te enviamos un enlace de acceso a <span className="text-white">{email}</span>
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-[#7F77DD] text-sm hover:underline"
              >
                Usar otro correo
              </button>
            </div>
          ) : (
            <>
              {/* Google */}
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-gray-800 font-medium text-sm hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#1f1f1f]" />
                <span className="text-[#444] text-xs">o</span>
                <div className="flex-1 h-px bg-[#1f1f1f]" />
              </div>

              {/* Email magic link */}
              <form onSubmit={handleEmail} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#7F77DD] transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-3 rounded-xl bg-[#7F77DD] text-white font-medium text-sm hover:bg-[#6B63C9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Continuar con email'}
                </button>
              </form>

              {error && (
                <p className="text-red-400 text-xs text-center">{error}</p>
              )}
            </>
          )}
        </div>

        <p className="text-center text-[#333] text-xs mt-6">
          ¿Eres consultor? Inicia sesión con tu cuenta y gestiona a tus clientes desde tu dashboard.
        </p>
      </div>
    </div>
  );
}
