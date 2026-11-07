import React, { useState, useEffect } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppRepository } from '../../services/storage';
import { Invitation, Client } from '../../types';

interface ActivateInviteProps {
  initialToken?: string;
  onBackToLogin: () => void;
  onSuccess: () => void;
}

export const ActivateInvite: React.FC<ActivateInviteProps> = ({
  initialToken = '',
  onBackToLogin,
  onSuccess,
}) => {
  const { acceptInvitation } = useAuth();

  const [token, setToken] = useState(initialToken || 'inv_tok_marina_884920');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteDetails, setInviteDetails] = useState<{ invite: Invitation; client?: Client } | null>(null);

  // Busca detalhes do convite para mostrar a empresa/ficha correspondente
  useEffect(() => {
    async function checkToken() {
      if (!token.trim()) return;
      try {
        const inv = await AppRepository.getInvitationByToken(token.trim());
        if (inv) {
          const client = await AppRepository.getClientById(inv.clientId);
          setInviteDetails({ invite: inv, client });
          if (!name && client) {
            setName(client.contacts[0]?.name || '');
          }
        } else {
          setInviteDetails(null);
        }
      } catch (e) {}
    }
    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const res = await acceptInvitation(token, name, password);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Não foi possível ativar o convite.');
      }
    } catch (err) {
      setError('Erro ao processar ativação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Ativar Acesso ao Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Confirme seu convite e defina sua senha para acompanhar suas landing pages.
          </p>
        </div>

        {inviteDetails?.client && (
          <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-xs text-purple-900 dark:text-purple-300">
            <div className="font-semibold flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Convite Válido Localizado</span>
            </div>
            <p>
              Vínculo: <strong>{inviteDetails.client.publicProfile.publicName || inviteDetails.client.identificationName}</strong>
            </p>
            <p className="text-[11px] text-purple-700 dark:text-purple-400 mt-0.5">
              E-mail convidado: {inviteDetails.invite.email}
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Token do Convite
            </label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full py-2.5 px-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="inv_tok_..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Seu Nome Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-2.5 px-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ex: Marina Silveira"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Definir Nova Senha
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2.5 px-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirmar Senha
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full py-2.5 px-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Digite a mesma senha"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onBackToLogin}
              className="w-1/3 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 flex items-center justify-center gap-1.5 transition-colors"
            >
              {loading ? 'Ativando...' : 'Ativar Minha Conta'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
