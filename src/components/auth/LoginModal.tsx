import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginModalProps {
  onOpenInviteActivation: (token?: string) => void;
  onOpenDemoAccounts: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onOpenInviteActivation,
  onOpenDemoAccounts,
}) => {
  const { login, mfaPendingUser, verifyMfa, cancelMfa, requestPasswordReset } = useAuth();

  const [activeTab, setActiveTab] = useState<'admin' | 'client'>('admin');
  const [email, setEmail] = useState('admin@central.com.br');
  const [password, setPassword] = useState('Admin@1234');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // MFA state
  const [mfaCode, setMfaCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState('');

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotFeedback, setForgotFeedback] = useState('');

  const handleTabChange = (tab: 'admin' | 'client') => {
    setActiveTab(tab);
    setErrorMessage('');
    if (tab === 'admin') {
      setEmail('admin@central.com.br');
      setPassword('Admin@1234');
    } else {
      setEmail('marina@fotografia.com');
      setPassword('Cliente@1234');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Credenciais inválidas');
      }
    } catch (err) {
      setErrorMessage('Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError('');
    setMfaLoading(true);

    try {
      const res = await verifyMfa(mfaCode);
      if (!res.success) {
        setMfaError(res.error || 'Código incorreto');
      }
    } catch (err) {
      setMfaError('Erro na validação do código.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    const res = await requestPasswordReset(forgotEmail);
    setForgotFeedback(res.message);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal de MFA para Administrador */}
        {mfaPendingUser ? (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Autenticação de Segundo Fator (MFA)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A conta <span className="font-semibold text-slate-700 dark:text-slate-300">{mfaPendingUser.email}</span> requer validação adicional de segurança com sessão de 30 minutos.
              </p>
            </div>

            {mfaError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{mfaError}</span>
              </div>
            )}

            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Código de Verificação de 6 Dígitos
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex: 123456"
                  className="w-full tracking-widest text-center text-2xl font-mono py-2.5 px-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <div className="mt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setMfaCode('123456')}
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Usar código de teste: 123456
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={cancelMfa}
                  className="w-1/2 py-2.5 px-4 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={mfaLoading || mfaCode.length < 6}
                  className="w-1/2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-50 transition-colors"
                >
                  {mfaLoading ? 'Validando...' : 'Confirmar MFA'}
                </button>
              </div>
            </form>
          </div>
        ) : showForgotPassword ? (
          /* Modal Esqueci Minha Senha */
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recuperação de Acesso</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Informe o e-mail cadastrado para receber as instruções com link protegido de uso único.
              </p>
            </div>

            {forgotFeedback ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p>{forgotFeedback}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotFeedback('');
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Voltar ao Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    E-mail da Conta
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full py-2.5 px-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-1/2 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                  >
                    Enviar Link
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Formulário Principal de Login */
          <>
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>Autenticação Criptografada JWT</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Entrar no Sistema
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecione o ambiente desejado para autenticar sua sessão.
              </p>
            </div>

            {/* Alternador de Ambiente: Painel Admin vs Portal do Cliente */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleTabChange('admin')}
                className={`py-2 rounded-lg transition-all ${
                  activeTab === 'admin'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Painel Admin
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('client')}
                className={`py-2 rounded-lg transition-all ${
                  activeTab === 'client'
                    ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Portal do Cliente
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail de Acesso
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="seuemail@exemplo.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgotPassword(true);
                    }}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'admin'
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                    : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25'
                }`}
              >
                {loading ? 'Validando...' : activeTab === 'admin' ? 'Acessar Painel Administrativo' : 'Entrar no Portal do Cliente'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Ações Secundárias: Ativação por convite & Troca de contas */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-center text-xs">
              <button
                type="button"
                onClick={() => onOpenInviteActivation()}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors font-medium"
              >
                Recebeu um convite por e-mail? Ative sua conta aqui
              </button>

              <button
                type="button"
                onClick={onOpenDemoAccounts}
                className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold hover:underline pt-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Clique aqui para preencher credenciais de teste em 1 clique
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
