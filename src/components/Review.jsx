import React from 'react';

export default function Review({ sessionPairs, saveTournament, discardTournament, appStage }) {
  const isFemale = appStage === 'reviewFemale';
  
  return (
    <div className="text-center py-10">
      <h2 className="text-3xl font-bold mb-6 text-brandRed">
        Resumo do Torneio {isFemale ? 'Feminino' : 'Masculino'}
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        Valide as duplas formadas. Sendo valido registraremos, senao comecaremos novamente.
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left mb-12">
        {sessionPairs.map((pair, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-brandRed shadow-md font-bold text-lg text-center">
            <span className="text-brandRed">{pair.player1}</span> 
            <span className="text-gray-400 mx-2">x</span> 
            <span className="text-brandRed">{pair.player2}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center gap-6">
        <button onClick={saveTournament} className="bg-green-600 text-white text-xl font-bold py-4 px-10 rounded shadow hover:bg-green-700 transition duration-300">
          Torneio Valido (Registrar)
        </button>
        <button onClick={discardTournament} className="bg-red-600 text-white text-xl font-bold py-4 px-10 rounded shadow hover:bg-red-700 transition duration-300">
          Torneio Invalido (Descartar)
        </button>
      </div>
    </div>
  );
}