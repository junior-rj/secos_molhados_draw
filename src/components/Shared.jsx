import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export function Header() {
  return (
    <header className="bg-brandRed text-white p-4 shadow-md flex justify-between items-center border-b-4 border-brandGold">
      <div className="flex items-center space-x-4">
        <img src={`${import.meta.env.BASE_URL}logo.jpeg`} alt="Logotipo Secos e Molhados" className="w-12 h-12 rounded-full border-2 border-brandGold" />
        <h1 className="text-xl md:text-2xl font-bold tracking-wide">TTC Secos e Molhados Sorteio</h1>
      </div>
      <button onClick={() => signOut(auth)} className="bg-white text-brandRed px-4 py-2 rounded font-bold hover:bg-gray-200 transition duration-300">Sair</button>
    </header>
  );
}

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-16 h-16 border-4 border-brandRed border-t-brandGold rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-bold text-gray-700">Carregando banco de dados</h2>
    </div>
  );
}

export function DoneScreen({ sessionPairs }) {
  return (
    <div className="text-center py-10">
      <h2 className="text-4xl font-black text-brandRed mb-6">Sorteio Concluido com Sucesso</h2>
      <p className="text-xl text-gray-600 mb-8">Todas as duplas foram geradas e salvas no banco de dados.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
        {sessionPairs.map((pair, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-brandRed shadow-md font-bold text-lg">
            {pair.player1} e {pair.player2}
          </div>
        ))}
      </div>
      <button onClick={() => window.location.reload()} className="mt-10 bg-brandGold text-white font-bold py-3 px-8 rounded hover:bg-yellow-600 transition duration-300">Iniciar Novo Evento</button>
    </div>
  );
}
