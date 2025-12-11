import React, { useState } from 'react';
import FormFieldWrapper from './FormFieldWrapper';
import { useFormMode } from '../hooks/useFormMode';

/**
 * Exemple d'utilisation du FormFieldWrapper
 * 
 * Avantages de cette approche :
 * 1. ✅ Centralisé : Un seul endroit pour gérer la désactivation
 * 2. ✅ Maintenable : Ajouter un champ = pas besoin de se rappeler de le désactiver
 * 3. ✅ Réutilisable : Peut être utilisé dans n'importe quel formulaire
 * 4. ✅ Type-safe : TypeScript garantit la cohérence
 * 5. ✅ Flexible : Peut gérer différents types d'éléments de formulaire
 */
const FormFieldWrapperExample: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', age: '', comments: '' });

  // Gestion centralisée des modes
  const { isReadOnly, isEditable: _isEditable, isCreating, isEditing, isViewing } = useFormMode({
    editingId,
    showForm,
    defaultMode: 'create'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleView = () => {
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = () => {
    setEditingId('example-id');
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setForm({ name: '', email: '', age: '', comments: '' });
    setShowForm(true);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Exemple FormFieldWrapper</h2>
      
      <div className="mb-4 space-x-2">
        <button onClick={handleCreate} className="bg-blue-500 text-white px-4 py-2 rounded">
          Créer
        </button>
        <button onClick={handleEdit} className="bg-green-500 text-white px-4 py-2 rounded">
          Modifier
        </button>
        <button onClick={handleView} className="bg-gray-500 text-white px-4 py-2 rounded">
          Consulter
        </button>
      </div>

      {showForm && (
        <form className="max-w-md space-y-4 p-4 border rounded">
          <h3 className="text-lg font-semibold">
            {isCreating ? 'Créer' : isEditing ? 'Modifier' : 'Consulter'} un utilisateur
          </h3>

          {/* Tous les champs sont automatiquement désactivés en mode consultation */}
          <FormFieldWrapper disabled={isReadOnly}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Nom</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Entrez le nom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Entrez l'email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Âge</label>
                <input
                  name="age"
                  type="number"
                  value={form.age}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Entrez l'âge"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Commentaires</label>
                <textarea
                  name="comments"
                  value={form.comments}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Entrez des commentaires"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Type</label>
                <select className="w-full border rounded px-3 py-2">
                  <option value="admin">Administrateur</option>
                  <option value="user">Utilisateur</option>
                  <option value="guest">Invité</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span>Activer les notifications</span>
                </label>
              </div>
            </div>
          </FormFieldWrapper>

          <div className="flex justify-end space-x-2">
            {isEditing ? (
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                Sauvegarder
              </button>
            ) : isViewing ? (
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-600 text-white px-4 py-2 rounded">
                Fermer
              </button>
            ) : (
              <>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  Créer
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-600 text-white px-4 py-2 rounded">
                  Annuler
                </button>
              </>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default FormFieldWrapperExample;
