import React, { useState } from 'react';
import {
  UserCheck,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  LogOut,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Client } from '../../types';

interface PortalAccountProps {
  client: Client;
  onLogout: () => void;
}

export const PortalAccount: React.FC<PortalAccountProps> = ({ client, onLogout }) => {
  const { currentUser, resetPassword, jwtToken } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }

    if (!currentUser?.email) return;

    setLoading(true);
    try {
      const res = await resetPassword(currentUser.email, newPassword);
      if (res.success) {
        setSuccessMsg('Senha alterada com sucesso! Suas sessões ativas foram protegidas.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMsg(res.error || 'Erro ao alterar a senha.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Minha Conta & Segurança
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Gerenciamento de credenciais, sessão JWT criptografada e vínculos da sua conta.
        </p>
      </div>

      {/* Informações Cadastrais da Conta */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
        <h2 className="font-bold text-slate-900 dark:text-white text-base">
          Dados de Acesso
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-semibold text-slate-500 block mb-1">Nome Cadastrado</span>
            <div className="font-bold text-slate-900 dark:text-white">{currentUser?.name}</div>
          </div>

          <div>
            <span className="font-semibold text-slate-500 block mb-1">E-mail da Conta</span>
            <div className="font-bold text-slate-900 dark:text-white">{currentUser?.email}</div>
          </div>

          <div>
            <span className="font-semibold text-slate-500 block mb-1">Empresa / Ficha Ativa</span>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>{client.publicProfile.publicName || client.identificationName}</span>
            </div>
          </div>

          <div>
            <span className="font-semibold text-slate-500 block mb-1">Segurança da Sessão</span>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <Lock className="w-3 h-3" />
              <span>JWT Assinado & AES-GCM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Troca de Senha */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-slate-900 dark:text-white text-base">
            Alterar Senha de Acesso
          </h2>
        </div>

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nova Senha (Mínimo 6 caracteres)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full py-2.5 px-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full py-2.5 px-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
          >
            {loading ? 'Atualizando...' : 'Salvar Nova Senha'}
          </button>
        </form>
      </div>

      {/* Botão de Encerramento de Sessão */}
      <div className="pt-2 flex justify-center">
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Encerrar Sessão no Portal
        </button>
      </div>
    </div>
  );
};
