# FormFieldWrapper - Solution générique pour la désactivation de formulaires

## Problème résolu

Avant cette solution, pour désactiver un formulaire en mode consultation, il fallait :
- Ajouter `disabled={isReadOnly}` sur chaque champ
- Ajouter `className={isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}` sur chaque champ
- Se rappeler de faire cela pour chaque nouveau champ ajouté
- Risque d'oubli et de code dupliqué

## Solution proposée

### 1. FormFieldWrapper
Composant wrapper qui désactive automatiquement tous ses enfants :

```tsx
<FormFieldWrapper disabled={isReadOnly}>
  <input name="email" value={email} onChange={handleChange} />
  <select value={type} onChange={handleSelect}>
    <option value="admin">Admin</option>
  </select>
  <textarea value={comments} onChange={handleChange} />
</FormFieldWrapper>
```

### 2. useFormMode Hook
Hook centralisé pour gérer les modes de formulaire :

```tsx
const { isReadOnly, isEditing, isViewing, isCreating } = useFormMode({
  editingId,
  showForm,
  defaultMode: 'create'
});
```

### 3. Avantages

✅ **Centralisé** : Un seul endroit pour gérer la désactivation  
✅ **Maintenable** : Ajouter un champ = pas besoin de se rappeler de le désactiver  
✅ **Réutilisable** : Peut être utilisé dans n'importe quel formulaire  
✅ **Type-safe** : TypeScript garantit la cohérence  
✅ **Flexible** : Gère différents types d'éléments (input, select, textarea, checkbox)  

## Utilisation

### Exemple simple
```tsx
const MyForm = () => {
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  return (
    <form>
      <FormFieldWrapper disabled={isReadOnly}>
        <input name="name" />
        <input name="email" />
        <textarea name="comments" />
      </FormFieldWrapper>
    </form>
  );
};
```

### Exemple avec useFormMode
```tsx
const MyForm = () => {
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const { isReadOnly, isEditing, isViewing } = useFormMode({
    editingId,
    showForm,
    defaultMode: 'create'
  });
  
  return (
    <form>
      <h3>{isEditing ? 'Modifier' : isViewing ? 'Consulter' : 'Créer'}</h3>
      
      <FormFieldWrapper disabled={isReadOnly}>
        <input name="name" />
        <input name="email" />
      </FormFieldWrapper>
      
      <div>
        {isEditing ? (
          <button type="submit">Sauvegarder</button>
        ) : isViewing ? (
          <button onClick={closeForm}>Fermer</button>
        ) : (
          <button type="submit">Créer</button>
        )}
      </div>
    </form>
  );
};
```

## Types d'éléments supportés

- ✅ `input` (text, email, number, etc.)
- ✅ `select` et `option`
- ✅ `textarea`
- ✅ `input[type="checkbox"]`
- ✅ `input[type="radio"]`
- ✅ `button` (pour les sélecteurs)

## Styles appliqués automatiquement

En mode désactivé :
- `disabled={true}` sur tous les éléments de formulaire
- `bg-gray-100` pour l'arrière-plan gris
- `cursor-not-allowed` pour le curseur
- `opacity-75` pour l'opacité réduite
- `pointer-events-none` sur le wrapper

## Migration depuis l'ancienne approche

### Avant
```tsx
<input 
  name="email" 
  value={email} 
  onChange={handleChange}
  disabled={!editingId && showForm}
  className={`w-full border rounded px-2 py-1 ${!editingId && showForm ? 'bg-gray-100 cursor-not-allowed' : ''}`}
/>
```

### Après
```tsx
<FormFieldWrapper disabled={isReadOnly}>
  <input 
    name="email" 
    value={email} 
    onChange={handleChange}
    className="w-full border rounded px-2 py-1"
  />
</FormFieldWrapper>
```

## Conclusion

Cette solution élimine le risque d'oubli et rend le code plus maintenable. Il suffit d'ajouter un nouveau champ dans le `FormFieldWrapper` et il sera automatiquement désactivé en mode consultation.
