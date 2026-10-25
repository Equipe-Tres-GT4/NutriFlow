import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Cadastro() {
  const { cadastrar } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })
  const [erro, setErro] = useState('')

  const mudar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  function enviar(e) {
    e.preventDefault()
    if (form.senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres.')
    try {
      cadastrar(form)
      navigate('/login')
    } catch (err) {
      setErro(err.message)
    }
  }

  return (
    <form onSubmit={enviar}>
      <h1>Criar conta</h1>
      <input name="nome" placeholder="Nome" value={form.nome} onChange={mudar} required />
      <input name="email" type="email" placeholder="E-mail" value={form.email} onChange={mudar} required />
      <input name="senha" type="password" placeholder="Senha" value={form.senha} onChange={mudar} required />
      {erro && <p role="alert">{erro}</p>}
      <button type="submit">Cadastrar</button>
      <p>Já tem conta? <Link to="/login">Entrar</Link></p>
    </form>
  )
}