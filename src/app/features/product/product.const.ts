import { ToastModel } from '../../utility/store/toast/toast.models';

export const TOAST_PRODUCT: { success: ToastModel; error: ToastModel } = {
  success: {
    title: 'Sucesso',
    message: 'Produto cadastrado com sucesso!',
    type: 'success',
  },
  error: {
    title: 'Erro',
    message: 'Erro ao cadastrar produto!',
    type: 'error',
  },
};
