import React, { createContext, useContext, useState, useEffect } from 'react'
import { receitas as dadosReceitas } from '../data/receitas'

const RecipeContext = createContext(null)

// Carregamento com recuperação de erros para evitar paragens no arranque
const carregarReceitasIniciais = () => {
  try {
    const guardadas = localStorage.getItem('nutriflow_recipes')
    if (guardadas && guardadas !== 'undefined' && guardadas !== 'null') {
      const parsed = JSON.parse(guardadas)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (erro) {
    console.error('Erro ao ler receitas do localStorage:', erro)
  }
  return Array.isArray(dadosReceitas) ? dadosReceitas : []
}

const carregarSalvosIniciais = () => {
  try {
    const guardados = localStorage.getItem('nutriflow_saved_ids')
    if (guardados && guardados !== 'undefined' && guardados !== 'null') {
      const parsed = JSON.parse(guardados)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (erro) {
    console.error('Erro ao ler salvos do localStorage:', erro)
  }
  return []
}

export function RecipeProvider({ children }) {
  const [recipes, setRecipes] = useState(carregarReceitasIniciais)
  const [savedRecipeIds, setSavedRecipeIds] = useState(carregarSalvosIniciais)

  const [currentUser] = useState({
    id: 'usr_1',
    name: 'Utilizador NutriFlow',
    isAuthenticated: true,
  })

  useEffect(() => {
    try {
      localStorage.setItem('nutriflow_recipes', JSON.stringify(recipes))
    } catch (e) {
      console.error(e)
    }
  }, [recipes])

  useEffect(() => {
    try {
      localStorage.setItem('nutriflow_saved_ids', JSON.stringify(savedRecipeIds))
    } catch (e) {
      console.error(e)
    }
  }, [savedRecipeIds])

  // Cálculo ponderado do Score: Nota (70%) + Popularidade de Salvos (30%)
  const calculateScore = (recipe) => {
    if (!recipe) return 0
    const nota = Number(recipe.rating || recipe.nota || 4.5)
    const salvos = Number(recipe.savesCount || recipe.salvos || 0)
    const notaValida = isNaN(nota) ? 0 : nota
    const salvosValidos = isNaN(salvos) ? 0 : salvos
    return Number((notaValida * 0.7 + Math.min(salvosValidos, 30) * 0.1).toFixed(2))
  }

  // 6 receitas com maior pontuação para o destaque da página inicial
  const featuredRecipes = [...recipes]
    .map((r) => ({ ...r, score: calculateScore(r) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)

  // Alternar gravação/remoção de receitas salvas
  const toggleSaveRecipe = (recipeId) => {
    const idStr = String(recipeId)
    setSavedRecipeIds((anteriores) => {
      const jaExiste = anteriores.includes(idStr)
      const atualizados = jaExiste
        ? anteriores.filter((id) => id !== idStr)
        : [...anteriores, idStr]

      setRecipes((atuais) =>
        atuais.map((item) => {
          const itemId = String(item.id || item.title || item.nome)
          if (itemId === idStr) {
            const contagemAtual = Number(item.savesCount || item.salvos || 0)
            return {
              ...item,
              savesCount: jaExiste ? Math.max(0, contagemAtual - 1) : contagemAtual + 1,
            }
          }
          return item
        })
      )

      return atualizados
    })
  }

  // Avaliação de 1 a 5 estrelas
  const rateRecipe = (recipeId, starRating) => {
    const idStr = String(recipeId)
    const estrelas = Number(starRating)
    if (estrelas < 1 || estrelas > 5) return

    setRecipes((anteriores) =>
      anteriores.map((recipe) => {
        const itemId = String(recipe.id || recipe.title || recipe.nome)
        if (itemId === idStr) {
          const totalVotos = Number(recipe.ratingCount || 1) + 1
          const mediaAtual = Number(recipe.rating || recipe.nota || 4.5)
          const novaMedia = Number(((mediaAtual * (totalVotos - 1) + estrelas) / totalVotos).toFixed(1))

          return {
            ...recipe,
            rating: novaMedia,
            nota: novaMedia,
            ratingCount: totalVotos,
          }
        }
        return recipe
      })
    )
  }

  // Adição de nova receita à comunidade
  const addRecipe = (novaReceita) => {
    const receitaCriada = {
      ...novaReceita,
      id: String(Date.now()),
      author: currentUser.name,
      rating: 5.0,
      nota: 5.0,
      ratingCount: 1,
      savesCount: 0,
      image: novaReceita.image || '/boloCenoura.jpg',
      imagem: novaReceita.image || '/boloCenoura.jpg',
    }

    setRecipes((anteriores) => [receitaCriada, ...anteriores])
    return true
  }

  // Clonagem de receita existente
  const cloneRecipe = (recipeId) => {
    const idStr = String(recipeId)
    const encontrada = recipes.find(
      (r) => String(r.id || r.title || r.nome) === idStr
    )
    if (!encontrada) return null

    return {
      ...encontrada,
      id: '',
      title: `${encontrada.title || encontrada.nome} (Cópia)`,
      nome: `${encontrada.title || encontrada.nome} (Cópia)`,
      author: currentUser.name,
      rating: 0,
      nota: 0,
      ratingCount: 0,
      savesCount: 0,
    }
  }

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        featuredRecipes,
        savedRecipeIds,
        toggleSaveRecipe,
        rateRecipe,
        addRecipe,
        cloneRecipe,
        currentUser,
      }}
    >
      {children}
    </RecipeContext.Provider>
  )
}

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