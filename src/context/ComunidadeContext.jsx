import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { receitasIniciais, textoSeguro } from '../utils/nutriflow'

const ComunidadeContext = createContext(null)

function lerDados(chave) {
  try {
    const dados = JSON.parse(localStorage.getItem(chave) || 'null')
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) throw new Error('Formato inválido')
    return {
      favoritos: Array.isArray(dados.favoritos) ? dados.favoritos.filter((id) => typeof id === 'string').slice(0, 300) : [],
      curtidas: Array.isArray(dados.curtidas) ? dados.curtidas.filter((id) => typeof id === 'string').slice(0, 300) : [],
      receitas: Array.isArray(dados.receitas) ? dados.receitas.filter((item) => item && typeof item === 'object' && typeof item.nome === 'string' && Array.isArray(item.ingredientes) && Array.isArray(item.modoPreparo)).slice(0, 100) : [],
      comentarios: dados.comentarios && typeof dados.comentarios === 'object' && !Array.isArray(dados.comentarios) ? dados.comentarios : {},
    }
  } catch {
    return { favoritos: [], curtidas: [], receitas: [], comentarios: {} }
  }
}

export function ComunidadeProvider({ children }) {
  const { usuario } = useAuth()
  const chave = `nf-demo-comunidade-v1:${encodeURIComponent(usuario?.email || 'anonimo')}`
  const [dados, setDados] = useState(() => lerDados(chave))

  useEffect(() => {
    try { localStorage.setItem(chave, JSON.stringify(dados)) } catch { /* Armazenamento bloqueado ou sem espaço: a interface continua utilizável. */ }
  }, [chave, dados])

  const receitas = useMemo(() => [...dados.receitas, ...receitasIniciais], [dados.receitas])
  const favoritos = dados.favoritos
  const curtidas = dados.curtidas

  function alternarFavorito(id) {
    setDados((atual) => ({ ...atual, favoritos: atual.favoritos.includes(id) ? atual.favoritos.filter((item) => item !== id) : [...atual.favoritos, id] }))
  }

  function alternarCurtida(id) {
    setDados((atual) => ({ ...atual, curtidas: atual.curtidas.includes(id) ? atual.curtidas.filter((item) => item !== id) : [...atual.curtidas, id] }))
  }

  function publicarReceita(receita) {
    const id = `minha-${crypto.randomUUID()}`
    setDados((atual) => ({ ...atual, receitas: [{ ...receita, id, origem: 'comunidade', autor: usuario.nome, publicadoEm: new Date().toISOString().slice(0, 10), imagem: '/receita.jpg' }, ...atual.receitas].slice(0, 100) }))
    return id
  }

  function excluirReceita(id) {
    setDados((atual) => ({ ...atual, receitas: atual.receitas.filter((item) => item.id !== id), favoritos: atual.favoritos.filter((item) => item !== id), curtidas: atual.curtidas.filter((item) => item !== id) }))
  }

  function adicionarComentario(id, texto) {
    const conteudo = textoSeguro(texto, 500)
    if (conteudo.length < 3) throw new Error('Escreva ao menos 3 caracteres.')
    setDados((atual) => {
      const anteriores = Array.isArray(atual.comentarios[id]) ? atual.comentarios[id] : []
      const novo = { id: crypto.randomUUID(), autor: textoSeguro(usuario.nome, 100), conteudo, data: new Date().toISOString() }
      return { ...atual, comentarios: { ...atual.comentarios, [id]: [...anteriores, novo].slice(-100) } }
    })
  }

  return (
    <ComunidadeContext.Provider value={{ receitas, favoritos, curtidas, minhasReceitas: dados.receitas, comentarios: dados.comentarios, alternarFavorito, alternarCurtida, publicarReceita, excluirReceita, adicionarComentario }}>
      {children}
    </ComunidadeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useComunidade() { return useContext(ComunidadeContext) }
