import { useState } from 'react'
import { enviarMidia } from '../service/api'
import './MidiaUploader.css'

const configura = {
  imagem: { extensoes: 'image/jpeg,image/png,image/webp', limite: 8_000_000, rotulo: 'Foto', exemplos: 'JPG, PNG ou WebP (até 8 MB)' },
  video: { extensoes: 'video/mp4,video/webm', limite: 25_000_000, rotulo: 'Vídeo', exemplos: 'MP4 ou WebM (até 25 MB)' },
}

/** Upload real: a API autentica, valida a assinatura e devolve uma URL local.
 * Não há campos pedindo que o participante cole links externos.
 */
export default function MidiaUploader({ imagemUrl = '', videoUrl = '', onChange, onBusyChange, somenteFoto = false }) {
  const [enviando, setEnviando] = useState('')
  const [erro, setErro] = useState('')
  const alterar = (campo, valor) => onChange(campo, valor)

  async function selecionar(e, tipo) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    e.target.value = ''
    const conf = configura[tipo]
    if (!conf.extensoes.split(',').includes(arquivo.type) || arquivo.size > conf.limite || arquivo.size === 0) {
      setErro(`Escolha ${conf.rotulo.toLowerCase()} válida: ${conf.exemplos}.`)
      return
    }
    setErro(''); setEnviando(tipo); onBusyChange?.(true)
    try {
      const resposta = await enviarMidia(arquivo)
      if ((tipo === 'video' && resposta.tipo !== 'video') || (tipo === 'imagem' && resposta.tipo !== 'imagem')) throw new Error('O tipo do arquivo enviado não corresponde ao selecionado.')
      alterar(tipo === 'imagem' ? 'imagemUrl' : 'videoUrl', resposta.url)
    } catch (err) { setErro(err.message) }
    finally { setEnviando(''); onBusyChange?.(false) }
  }

  return <section className="nf-media-uploader" aria-label="Fotos e vídeos da publicação">
    <div className="nf-media-uploader-top"><strong><i className="bi bi-camera" /> Fotos e vídeos</strong><span>Escolha arquivos do seu dispositivo</span></div>
    <div className="nf-media-uploader-grid">
      <div className="nf-upload-item">
        <label className="nf-upload-picker" htmlFor="nf-arquivo-foto"><i className="bi bi-image" /> {enviando === 'imagem' ? 'Enviando foto...' : imagemUrl ? 'Trocar foto' : 'Adicionar foto'}</label>
        <input id="nf-arquivo-foto" type="file" accept={configura.imagem.extensoes} onChange={e => selecionar(e, 'imagem')} disabled={Boolean(enviando)} />
        <small>{configura.imagem.exemplos}</small>
        {imagemUrl && <div className="nf-upload-preview"><img src={imagemUrl} alt="Pré-visualização da foto enviada" /><button type="button" onClick={() => alterar('imagemUrl', '')} aria-label="Remover foto">Remover foto</button></div>}
      </div>
      {!somenteFoto && <div className="nf-upload-item">
        <label className="nf-upload-picker" htmlFor="nf-arquivo-video"><i className="bi bi-camera-video" /> {enviando === 'video' ? 'Enviando vídeo...' : videoUrl ? 'Trocar vídeo' : 'Adicionar vídeo'}</label>
        <input id="nf-arquivo-video" type="file" accept={configura.video.extensoes} onChange={e => selecionar(e, 'video')} disabled={Boolean(enviando)} />
        <small>{configura.video.exemplos}</small>
        {videoUrl && <div className="nf-upload-preview"><video src={videoUrl} controls playsInline preload="metadata" aria-label="Prévia do vídeo enviado" /><button type="button" onClick={() => alterar('videoUrl', '')} aria-label="Remover vídeo">Remover vídeo</button></div>}
      </div>}
    </div>
    {enviando && <p className="nf-media-status" role="status">Enviando {enviando === 'imagem' ? 'foto' : 'vídeo'} com segurança. Não feche esta tela.</p>}
    {erro && <p className="nf-media-error" role="alert">{erro}</p>}
  </section>
}
