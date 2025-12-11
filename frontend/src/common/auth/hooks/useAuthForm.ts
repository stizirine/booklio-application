import api from '@services/api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types';

interface UseAuthFormProps {
  endpoint: string;
  onSuccess: (authData: AuthResponse) => void;
}

export const useAuthForm = <T extends LoginRequest | RegisterRequest>({
  endpoint,
  onSuccess
}: UseAuthFormProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<T>({} as T);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post(endpoint, formData);
      const authData = response.data as AuthResponse;
      
      // Stocker les tokens
      localStorage.setItem('accessToken', authData.tokens.accessToken);
      localStorage.setItem('refreshToken', authData.tokens.refreshToken);
      
      onSuccess(authData);
    } catch (err: any) {
      const errorKey = endpoint.includes('login') ? 'auth.loginError' : 'auth.registerError';
      setError(err.response?.data?.error || t(errorKey));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({} as T);
    setError('');
    setLoading(false);
  };

  return {
    formData,
    setFormData,
    loading,
    error,
    handleSubmit,
    handleChange,
    resetForm
  };
};
