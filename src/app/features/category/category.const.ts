import { COMMON_ERROR } from '../../utility/constants/common-toast-error.conts';
import { ToastModel } from '../../utility/store/toast/toast.models';

export const TOAST_CATEGORY = {
  success: {
    title: 'Categoria criada com sucesso!',
    message: 'A categoria foi criada e já pode ser utilizada para ser associada a algum produto.',
    type: 'success',
    duration: 5000,
  } as ToastModel,
  error: {
    ...COMMON_ERROR,
  } as ToastModel,
};
