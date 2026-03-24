import React from 'react';

export default function Auth({ email, setEmail, password, setPassword, handleLogin }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-xl w-96 border-t-4 border-brandRed">
        <div className="text-center mb-6">
          <img src={`${import.meta.env.BASE_URL}logo.jpeg`} alt="Logotipo Secos e Molhados" className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-brandGold shadow-md" />
          <h2 className="text-2xl font-bold text-brandRed">Secos e Molhados</h2>
          <p className="text-gray-500 font-medium">Sistema de Sorteio 2026</p>
        </div>
        <input type="email" placeholder="Email Autorizado" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brandRed" />
        <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brandRed" />
        <button type="submit" className="w-full bg-brandRed text-white font-bold py-3 rounded hover:bg-red-800 transition duration-300">Acessar Sistema</button>
      </form>
    </div>
  );
}
