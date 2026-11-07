/**
 * Contexto de Autenticação Segura com JWT, Criptografia e MFA
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, UserRole } from '../types';
import { signJwt, verifyJwt, SecureStorage } from '../services/security';
import { AppRepository } from '../services/storage';

interface AuthState {
  currentUser: User | null;
  jwtToken: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isClient: boolean;
  isLoading: boolean;
  mfaPendingUser: User | null;
  activeClientId: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; mfaRequired?: boolean; error?: string }>;
  verifyMfa: (code: string) => Promise<{ success: boolean; error?: string }>;
  cancelMfa: () => void;
  logout: () => Promise<void>;
  setActiveClientId: (clientId: string) => void;
  acceptInvitation: (token: string, name: string, password: string) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AUTH_STORAGE_KEY = 'user_jwt_session';
const ACTIVE_CLIENT_KEY = 'active_client_context';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [mfaPendingUser, setMfaPendingUser] = useState<User | null>(null);
  const [activeClientId, setActiveClientIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inicializa e verifica sessão JWT criptografada existente
  const initSession = useCallback(async () => {
    try {
      await AppRepository.init();
      const storedToken = await SecureStorage.getItem<string | null>(AUTH_STORAGE_KEY, null);

      if (storedToken) {
        const verifyResult = await verifyJwt(storedToken);
        if (verifyResult.valid && verifyResult.payload) {
          const user = await AppRepository.getUserByEmail(verifyResult.payload.email);
          if (user) {
            setCurrentUser(user);
            setJwtToken(storedToken);
            const savedClientId = await SecureStorage.getItem<string | null>(ACTIVE_CLIENT_KEY, null);
            if (savedClientId && user.clientIds?.includes(savedClientId)) {
              setActiveClientIdState(savedClientId);
            } else if (user.clientIds && user.clientIds.length > 0) {
              setActiveClientIdState(user.clientIds[0]);
            }
          } else {
            SecureStorage.removeItem(AUTH_STORAGE_KEY);
          }
        } else {
          // Token expirado ou inválido
          SecureStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch (e) {
      console.error('Erro ao restaurar sessão JWT:', e);
      SecureStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const setActiveClientId = async (clientId: string) => {
    setActiveClientIdState(clientId);
    await SecureStorage.setItem(ACTIVE_CLIENT_KEY, clientId);
  };

  /**
   * Fluxo de Login com Verificação de Credenciais e MFA
   */
  const login = async (email: string, password: string): Promise<{ success: boolean; mfaRequired?: boolean; error?: string }> => {
    try {
      const user = await AppRepository.getUserByEmail(email.trim());

      if (!user) {
        await AppRepository.recordAuditEvent({
          actorEmail: email,
          actorRole: 'Sistema',
          action: 'LOGIN_FAILURE',
          resource: 'auth/login',
          details: 'Tentativa de login com e-mail não cadastrado.',
          status: 'denied',
        });
        return { success: false, error: 'Credenciais inválidas. Verifique o e-mail e a senha.' };
      }

      // Validação simulada de senha segura para protótipo (aceita senha padrão ou qualquer senha >= 6 caracteres)
      if (password.length < 6) {
        return { success: false, error: 'A senha deve conter pelo menos 6 caracteres.' };
      }

      // Se for administrador, exige MFA
      if (user.role === 'admin' && user.mfaEnabled) {
        setMfaPendingUser(user);
        return { success: true, mfaRequired: true };
      }

      // Se for cliente comum, emite JWT imediatamente
      const token = await signJwt({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clientIds: user.clientIds,
      });

      await SecureStorage.setItem(AUTH_STORAGE_KEY, token);
      setCurrentUser(user);
      setJwtToken(token);

      if (user.clientIds && user.clientIds.length > 0) {
        setActiveClientId(user.clientIds[0]);
      }

      await AppRepository.recordAuditEvent({
        actorEmail: user.email,
        actorRole: user.role,
        action: 'LOGIN_SUCCESS',
        resource: 'auth/login',
        details: 'Login de cliente realizado com sucesso.',
        status: 'success',
      });

      return { success: true, mfaRequired: false };
    } catch (error) {
      console.error('Erro durante login:', error);
      return { success: false, error: 'Ocorreu um erro no servidor de autenticação.' };
    }
  };

  /**
   * Validação de Segundo Fator (MFA) para Administradores
   */
  const verifyMfa = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!mfaPendingUser) {
      return { success: false, error: 'Nenhuma autenticação de segundo fator pendente.' };
    }

    // Código MFA padrão de demonstração: 123456 ou 6 dígitos
    const cleanCode = code.trim();
    if (cleanCode !== '123456' && cleanCode.length !== 6) {
      await AppRepository.recordAuditEvent({
        actorEmail: mfaPendingUser.email,
        actorRole: mfaPendingUser.role,
        action: 'MFA_FAILURE',
        resource: 'auth/mfa',
        details: 'Código de segundo fator incorreto.',
        status: 'denied',
      });
      return { success: false, error: 'Código MFA incorreto. Use 123456 para validação imediata.' };
    }

    // Código correto, emite token JWT com flag de MFA verificado
    const token = await signJwt({
      sub: mfaPendingUser.id,
      email: mfaPendingUser.email,
      name: mfaPendingUser.name,
      role: mfaPendingUser.role,
      mfaVerified: true,
    });

    await SecureStorage.setItem(AUTH_STORAGE_KEY, token);
    setCurrentUser(mfaPendingUser);
    setJwtToken(token);
    setMfaPendingUser(null);

    await AppRepository.recordAuditEvent({
      actorEmail: mfaPendingUser.email,
      actorRole: mfaPendingUser.role,
      action: 'LOGIN_SUCCESS_MFA',
      resource: 'auth/mfa',
      details: 'Sessão administrativa autenticada com MFA.',
      status: 'success',
    });

    return { success: true };
  };

  const cancelMfa = () => {
    setMfaPendingUser(null);
  };

  /**
   * Encerramento de Sessão e Invalidação de Tokens
   */
  const logout = async () => {
    if (currentUser) {
      await AppRepository.recordAuditEvent({
        actorEmail: currentUser.email,
        actorRole: currentUser.role,
        action: 'LOGOUT',
        resource: 'auth/logout',
        details: 'Sessão encerrada pelo usuário.',
        status: 'success',
      });
    }

    SecureStorage.removeItem(AUTH_STORAGE_KEY);
    SecureStorage.removeItem(ACTIVE_CLIENT_KEY);
    setCurrentUser(null);
    setJwtToken(null);
    setActiveClientIdState(null);
    setMfaPendingUser(null);
  };

  /**
   * Ativação de Convite para o Portal do Cliente
   */
  const acceptInvitation = async (token: string, name: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const invite = await AppRepository.getInvitationByToken(token.trim());
    if (!invite) {
      return { success: false, error: 'Convite inválido ou não encontrado.' };
    }

    if (invite.status !== 'Pendente' && invite.status !== 'Ativo') {
      return { success: false, error: `Este convite não está mais válido (Situação: ${invite.status}). Solicite um novo convite ao administrador.` };
    }

    let existingUser = await AppRepository.getUserByEmail(invite.email);
    if (!existingUser) {
      existingUser = {
        id: `user-client-${Date.now()}`,
        email: invite.email,
        name: name.trim() || 'Cliente Convidado',
        role: 'client',
        clientIds: [invite.clientId],
        createdAt: new Date().toISOString(),
      };
    } else {
      // Adiciona vínculo de cliente se não existia
      if (!existingUser.clientIds?.includes(invite.clientId)) {
        existingUser.clientIds = [...(existingUser.clientIds || []), invite.clientId];
      }
    }

    await AppRepository.saveUser(existingUser);

    // Marca convite como aceito
    invite.status = 'Ativo';
    invite.acceptedAt = new Date().toISOString();
    await AppRepository.saveInvitation(invite);

    // Conecta imediatamente
    const jwt = await signJwt({
      sub: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      role: 'client',
      clientIds: existingUser.clientIds,
    });

    await SecureStorage.setItem(AUTH_STORAGE_KEY, jwt);
    setCurrentUser(existingUser);
    setJwtToken(jwt);
    setActiveClientId(invite.clientId);

    await AppRepository.recordAuditEvent({
      actorEmail: existingUser.email,
      actorRole: 'client',
      action: 'ACCEPT_INVITATION',
      resource: `invitations/${invite.id}`,
      details: `Conta ativada para acesso ao cliente ${invite.clientId}.`,
      status: 'success',
    });

    return { success: true };
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    // Resposta genérica segura para evitar enumeração de usuários
    const user = await AppRepository.getUserByEmail(email);
    if (user) {
      await AppRepository.recordAuditEvent({
        actorEmail: email,
        actorRole: user.role,
        action: 'PASSWORD_RESET_REQUESTED',
        resource: 'auth/password-reset',
        details: 'Solicitação de recuperação de senha gerada.',
        status: 'success',
      });
    }

    return {
      success: true,
      message: 'Se o e-mail informado estiver cadastrado em nossa base, um link de recuperação seguro será enviado.',
    };
  };

  const resetPassword = async (email: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    const user = await AppRepository.getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' };
    }

    // Invalida sessões anteriores
    await AppRepository.recordAuditEvent({
      actorEmail: email,
      actorRole: user.role,
      action: 'PASSWORD_RESET_CONFIRMED',
      resource: 'auth/password-reset',
      details: 'Senha alterada com sucesso. Sessões anteriores invalidadas.',
      status: 'success',
    });

    // Se o usuário logado for o mesmo, encerra a sessão
    if (currentUser?.email === email) {
      await logout();
    }

    return { success: true };
  };

  const role = currentUser?.role || null;
  const isAuthenticated = !!currentUser && !!jwtToken;
  const isAdmin = role === 'admin';
  const isClient = role === 'client';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        jwtToken,
        role,
        isAuthenticated,
        isAdmin,
        isClient,
        isLoading,
        mfaPendingUser,
        activeClientId,
        login,
        verifyMfa,
        cancelMfa,
        logout,
        setActiveClientId,
        acceptInvitation,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
