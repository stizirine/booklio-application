import api from '@services/api';
import { User } from '../types';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  // Champs magasin (à plat selon l'API backend)
  storeName?: string;
  storeAddress?: string;
  phoneNumber?: string;
  patenteNumber?: string;
  rcNumber?: string;
  npeNumber?: string;
  iceNumber?: string;
  // Compatibilité ascendante: accepter un ancien objet store et l'aplatir côté client
  store?: Partial<{
    storeName: string;
    storeAddress: string;
    phoneNumber: string;
    patenteNumber: string;
    rcNumber: string;
    npeNumber: string;
    iceNumber: string;
  }>;
}

export interface UpdateProfileResponse {
  user: User;
  message: string;
}

export interface GetProfileResponse {
  user: User;
  tenant: {
    tenantId: string;
    clientType: string;
    capabilities: string[];
    featureFlags: Record<string, boolean>;
  };
}

/**
 * API pour la gestion du profil utilisateur
 */
export const profileApi = {
  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  async getProfile(): Promise<GetProfileResponse> {
    const response = await api.get('/v1/auth/me');
    return response.data;
  },

  /**
   * Mettre à jour le profil de l'utilisateur
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    // Aplatir une éventuelle clé store et nettoyer les champs non envoyés
    const flattenLegacyStore = (payload: UpdateProfileRequest): Record<string, string> => {
      const flattened: Record<string, any> = { ...payload };
      if (payload.store) {
        const { store } = payload as any;
        Object.assign(flattened, store);
        Object.keys(flattened).forEach((k) => {
          if (k === 'store') delete flattened[k];
        });
      }
      // Politique: ne jamais envoyer null; convertir null -> "", omettre undefined
      const cleaned: Record<string, string> = {};
      Object.entries(flattened).forEach(([key, value]) => {
        if (value === undefined) return; // ne pas modifier le champ
        if (value === null) {
          cleaned[key] = '';
        } else {
          cleaned[key] = String(value);
        }
      });
      return cleaned;
    };

    const payload = flattenLegacyStore(data);
    // Backend attend PUT (et non PATCH) sur /v1/auth/update-profile
    const response = await api.put('/v1/auth/update-profile', payload);
    return response.data;
  },

  /**
   * Changer le mot de passe
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const response = await api.patch('/v1/auth/change-password', data);
    return response.data;
  },

  /**
   * Uploader un avatar
   */
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post('/v1/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Supprimer l'avatar
   */
  async deleteAvatar(): Promise<{ message: string }> {
    const response = await api.delete('/v1/auth/avatar');
    return response.data;
  }
};
