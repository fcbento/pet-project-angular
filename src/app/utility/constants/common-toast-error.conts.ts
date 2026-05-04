import { ToastType } from '../store/toast/toast.types';

export const COMMON_ERROR = {
  title: 'Erro ao processar a solicitação',
  message: 'Tente novamente mais tarde.',
  type: 'error' as ToastType,
  duration: 1000,
};
