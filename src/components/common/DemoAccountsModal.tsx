import React, { useState } from 'react';
import { UserCheck, ShieldCheck, User, KeyRound, ExternalLink, X, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppRepository } from '../../services/storage';

interface DemoAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectInviteToken?: (token: string) => void;
}

export const DemoAccountsModal: React.FC<DemoAccountsModalProps> = ({ isOpen, onClose, onSelectInviteToken }) => {
  const { login, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  if (!isOpen) return null;

  const handleQuickLogin = async (email: string, role: string) => {
    setLoading(true);
    try {
      await logout();
      const res = await login(email, 'Senha@1234');
      if (res.mfaRequired) {
        // Para admin, avisa que precisará do código MFA
        onClose();
      } else if (res.success) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    if (confirm('Deseja restaurar todos os dados iniciais do sistema?')) {
      setResetting(true);
      await AppRepository.resetToDefaultSeed();
      await logout();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <UserCheck className="w-6 h-6" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Acesso Rápido para Avaliação</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400">
          Selecione uma conta para testar os ambientes autenticados do Painel Administrativo ou do Portal do Cliente:
        </p>

        <div className="space-y-3">
          {/* Conta 1: Admin */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/20 hover:border-blue-400 transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Admin Principal</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">MFA Ativo</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">admin@central.com.br (MFA: 123456)</div>
              </div>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('admin@central.com.br', 'admin')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              Entrar como Admin
            </button>
          </div>

          {/* Conta 2: Advogado Dr. Marcelo Bastos (Imagem 3) */}
          <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 hover:border-amber-400 transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=100&q=80"
                alt="Dr. Marcelo Bastos"
                className="w-9 h-9 rounded-full object-cover border border-amber-300 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">Dr. Marcelo Bastos (Advocacia)</span>
                  <span className="text-[9px] uppercase tracking-wider font-bold bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded">Imagem 3</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">marcelo@bastosadv.com.br • Modelo Advocacia & Leis</div>
              </div>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('marcelo@bastosadv.com.br', 'client')}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors shrink-0"
            >
              Entrar
            </button>
          </div>

          {/* Conta 3: Cabeleireiro & Nail Bar Camila Rocha (Imagem 4) */}
          <div className="p-3.5 rounded-xl border border-lime-200 dark:border-lime-900/50 bg-lime-50/60 dark:bg-lime-950/20 hover:border-lime-400 transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80"
                alt="Studio Lumina"
                className="w-9 h-9 rounded-full object-cover border border-lime-400 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">Studio Lumina (Cabelo &amp; Unhas)</span>
                  <span className="text-[9px] uppercase tracking-wider font-bold bg-lime-200 dark:bg-lime-900 text-lime-900 dark:text-lime-300 px-1.5 py-0.5 rounded">Imagem 4</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">contato@studiolumina.com.br • Modelo Cabelo &amp; Nail Bar</div>
              </div>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('contato@studiolumina.com.br', 'client')}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-lime-600 hover:bg-lime-700 text-white shadow-xs transition-colors shrink-0"
            >
              Entrar
            </button>
          </div>

          {/* Conta 4: BODREN Cafeteria Gourmet (Imagem 1) */}
          <div className="p-3.5 rounded-xl border border-amber-700/30 bg-[#2b1c13]/30 hover:border-amber-600 transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                alt="BODREN Cafe"
                className="w-9 h-9 rounded-full object-cover border border-amber-600 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">BODREN Café Especial (Comida 1)</span>
                  <span className="text-[9px] uppercase tracking-wider font-bold bg-[#3c271b] text-amber-300 px-1.5 py-0.5 rounded">Imagem 1</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">contato@graonobre.com.br • Modelo Cafeteria &amp; Grãos</div>
              </div>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('contato@graonobre.com.br', 'client')}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-700 hover:bg-amber-800 text-white shadow-xs transition-colors shrink-0"
            >
              Entrar
            </button>
          </div>

          {/* Conta 5: Hush Sushi Gastronomia (Imagem 2) */}
          <div className="p-3.5 rounded-xl border border-orange-200 dark:border-orange-950 bg-orange-50/60 dark:bg-orange-950/20 hover:border-orange-400 transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80"
                alt="Hush Sushi"
                className="w-9 h-9 rounded-full object-cover border border-orange-400 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">Hush Sushi Bar (Comida 2)</span>
                  <span className="text-[9px] uppercase tracking-wider font-bold bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300 px-1.5 py-0.5 rounded">Imagem 2</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">contato@hushsushi.com.br • Modelo Restaurante Sushi</div>
              </div>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('contato@hushsushi.com.br', 'client')}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors shrink-0"
            >
              Entrar
            </button>
          </div>

          {/* Conta 6: Cliente Marina */}
          <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/60 dark:bg-purple-950/20 hover:border-purple-400 transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                alt="Marina Silveira"
                className="w-9 h-9 rounded-full object-cover border border-purple-300 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">Marina Silveira</span>
                  <span className="text-[9px] uppercase tracking-wider font-bold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded">Portfólio</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">marina@fotografia.com</div>
              </div>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('marina@fotografia.com', 'client')}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors shrink-0"
            >
              Entrar
            </button>
          </div>
        </div>

        {/* Link para Ativação de Convite */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onSelectInviteToken) onSelectInviteToken('inv_tok_marina_884920');
            }}
            className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Simular tela de ativação de convite (/portal/ativar)
          </button>

          <button
            type="button"
            onClick={handleResetData}
            disabled={resetting}
            title="Restaura os dados originais criptografados"
            className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Seeds
          </button>
        </div>
      </div>
    </div>
  );
};
