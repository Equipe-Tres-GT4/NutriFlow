import { useEffect, useState } from 'react'
import { api } from '../service/api'

/** Estados e municípios sincronizados com a UF, sem estados antigos aparecendo durante novas consultas. */
export function useLocalidades(uf) {
  const [estados, setEstados] = useState([])
  const [carregandoEstados, setCarregandoEstados] = useState(true)
  const [avisoEstados, setAvisoEstados] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const [resultadoMunicipios, setResultadoMunicipios] = useState({ uf: '', cidades: [], aviso: '', carregando: false })
  const ufNormalizada = String(uf || '').toUpperCase()
  const ufValida = /^[A-Z]{2}$/.test(ufNormalizada)

  useEffect(() => {
    let ativo = true
    api('/integrations/location/states')
      .then(r => {
        if (!ativo) return
        const opcoes = Array.isArray(r.estados) ? r.estados : []
        setEstados(opcoes)
        setAvisoEstados(r.modoReserva
          ? 'Estados carregados da lista local oficial de UFs. A consulta ao IBGE está temporariamente indisponível.'
          : opcoes.length ? '' : 'Não foi possível carregar os estados. Tente novamente.')
      })
      .catch(() => { if (ativo) { setEstados([]); setAvisoEstados('Não foi possível conectar ao servidor para carregar os estados. Verifique se o backend está ligado.') } })
      .finally(() => { if (ativo) setCarregandoEstados(false) })
    return () => { ativo = false }
  }, [tentativa])

  useEffect(() => {
    if (!ufValida) return
    let ativo = true
    api(`/integrations/location/states/${ufNormalizada}/cities`)
      .then(r => {
        if (!ativo) return
        setResultadoMunicipios({
          uf: ufNormalizada,
          cidades: Array.isArray(r.cidades) ? r.cidades : [],
          aviso: r.modoManual ? 'Consulta de municípios indisponível. Você pode informar sua cidade manualmente.' : '',
          carregando: false,
        })
      })
      .catch(() => { if (ativo) setResultadoMunicipios({ uf: ufNormalizada, cidades: [], aviso: 'Não foi possível consultar municípios. Digite sua cidade manualmente.', carregando: false }) })
    return () => { ativo = false }
  }, [ufNormalizada, ufValida])

  const resultadoAtual = ufValida && resultadoMunicipios.uf === ufNormalizada ? resultadoMunicipios : null
  const cidades = resultadoAtual?.cidades || []
  const carregandoCidades = ufValida ? !resultadoAtual || resultadoAtual.carregando : false
  const avisoCidades = resultadoAtual?.aviso || ''
  const tentarNovamente = () => { setCarregandoEstados(true); setAvisoEstados(''); setTentativa(n => n + 1) }
  return { estados, cidades, carregandoEstados, carregandoCidades, avisoEstados, avisoCidades, tentarNovamente }
}
