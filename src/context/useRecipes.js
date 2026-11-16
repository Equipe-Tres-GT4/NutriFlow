import { useContext } from 'react'
import { receitas as dadosReceitas } from '../data/receitas'
import { RecipeContext } from './RecipeContextValue'

// Fallback para assegurar que chamadas ao hook nunca devolvam undefined
export const useRecipes = () => {
  const contexto = useContext(RecipeContext)
  if (!contexto) {
    return {
      recipes: Array.isArray(dadosReceitas) ? dadosReceitas : [],
      featuredRecipes: (Array.isArray(dadosReceitas) ? dadosReceitas : []).slice(0, 6),
      savedRecipeIds: [],
      toggleSaveRecipe: () => {},
      rateRecipe: () => {},
      addRecipe: () => false,
      cloneRecipe: () => null,
      currentUser: { id: 'usr_1', name: 'Utilizador', isAuthenticated: true },
    }
  }
  return contexto
}