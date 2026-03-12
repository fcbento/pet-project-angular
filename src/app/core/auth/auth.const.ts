import { COMMON_ERROR } from '../../utility/constants/common-toast-error.conts';
import { ToastModel } from '../../utility/store/toast/toast.models';
import { ToastType } from '../../utility/store/toast/toast.types';

export const AUTH = {
  loginTitle: 'Entrar',
  registerTitle: 'Criar conta',

  loginDescription: 'Acesse sua conta e gerencie seus dados',
  registerDescription: 'Crie sua conta e gerencie seus dados',

  loginLinkName: 'Ainda não tem conta? Cadastre-se',
  registerLinkName: 'Já tem conta? Entre',

  loginButtonName: 'Entrar',
  registerButtonName: 'Criar',
};

export const TOAST_REGISTER = {
  success: {
    title: 'Cadastro bem‑sucedido',
    message: 'Você se cadastrou com sucesso. Por favor, faça login.',
    type: 'success' as ToastType,
    duration: 4000,
  } as ToastModel,
  error: {
    ...COMMON_ERROR,
  } as ToastModel,
};

export const TOAST_LOGIN = {
  success: {
    title: 'Bem‑vindo de volta',
    message: 'Que bom te ver novamente. Estamos carregando seu painel agora.',
    type: 'success' as ToastType,
    duration: 3000,
  } as ToastModel,
  error: {
    ...COMMON_ERROR,
  } as ToastModel,
};
