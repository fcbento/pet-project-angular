import { ToastModel } from '../../utility/toast/toast.models';
import { ToastType } from '../../utility/toast/toast.types';

export const AUTH = {
  loginTitle: 'Sign in',
  registerTitle: 'Create',

  loginDescription: 'Access your account and manage your data',
  registerDescription: 'Create your account and manage your data',

  loginLinkName: 'Don’t have an account? Sign up',
  registerLinkName: 'Already have an account? Sign in',

  loginButtonName: 'Sign in',
  registerButtonName: 'Create',
};

const COMMON_ERROR = {
  title: 'Something went wrong',
  message: 'We couldn’t complete your request. Please try again later.',
  type: 'error' as ToastType,
  duration: 8000,
};

export const TOAST_REGISTER = {
  success: {
    title: 'Registration Successful',
    message: 'You have registered successfully. Please log in.',
    type: 'success' as ToastType,
    duration: 4000,
  } as ToastModel,
  error: {
    ...COMMON_ERROR,
  } as ToastModel,
};

export const TOAST_LOGIN = {
  success: {
    title: 'Welcome back',
    message: 'It’s great to see you again. We’re loading your dashboard now',
    type: 'success' as ToastType,
    duration: 2000,
  } as ToastModel,
  error: {
    ...COMMON_ERROR,
  } as ToastModel,
};
