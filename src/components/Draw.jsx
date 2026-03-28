import React from 'react';
import { isPairRepeated } from '../utils/logic';

export default function Draw({
  appStage,
  currentPair,
  isAnimating,
  handleDrawSequence,
  confirmPair,
  cancelPair,
  historyPairs,
  sessionPairs,
  drawStats
}) {
  
  const renderDrawButtons = () => {
    let isRepeated = false;
    if (currentPair.length === 2) {
      isRepeated = isPairRepeated(currentPair[0], currentPair[1], historyPairs);
    }

    if (currentPair.length === 0) {
      return (
        <button onClick={() => handleDrawSequence(1)} disabled={isAnimating} className="bg-gray-800 text-white text-xl font-bold py-4 px-10 rounded shadow hover:bg-gray-900 transition duration-300 disabled:opacity-50">
          Sortear Primeiro Jogador
        </button>
      );
    }
    
    if (currentPair.length === 1) {
      return (
        <button onClick={() => handleDrawSequence(2)} disabled={isAnimating} className="bg-gray-800 text-white text-xl font-bold py-4 px-10 rounded shadow hover:bg-gray-900 transition duration-300 disabled:opacity-50">
          Sortear Segundo Jogador
        </button>
      );
    }
    
    if (currentPair.length === 2) {
      if (isRepeated) {
        return (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-yellow-600 font-bold mb-2 text-lg">Aviso: Esta dupla ja jogou junta anteriormente.</p>
            <div className="flex space-x-4">
              <button onClick={confirmPair} className="bg-green-600 text-white text-xl font-bold py-4 px-10 rounded shadow hover:bg-green-700 transition duration-300">
                Confirmar Dupla
              </button>
              <button onClick={cancelPair} className="bg-red-600 text-white text-xl font-bold py-4 px-10 rounded shadow hover:bg-red-700 transition duration-300">
                Recusar Dupla
              </button>
            </div>
          </div>
        );
      } else {
        return (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-green-600 font-bold mb-2 text-lg">Dupla valida para a sessao.</p>
            <div className="flex space-x-4">
              <button onClick={confirmPair} className="bg-green-600 text-white text-xl font-bold py-4 px-10 rounded shadow hover:bg-green-700 transition duration-300">
                Confirmar Dupla
              </button>
              <button onClick={cancelPair} className="bg-gray-600 text-white text-xl font-bold py-4 px-10 rounded shadow hover:bg-gray-700 transition duration-300">
                Cancelar Sorteio
              </button>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="text-center relative">
      
      {isAnimating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-8 animate-pulse">Sorteando...</h2>
            <div className="flex space-x-6 justify-center">
              <span className="text-7xl animate-bounce" style={{ animationDelay: '0s' }}>🎾</span>
              <span className="text-7xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎾</span>
              <span className="text-7xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎾</span>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        {appStage === 'drawFemale' ? 'Sorteio Chave Feminina' : 'Sorteio Chave Masculina'}
      </h2>

      <div className="mb-8 flex flex-col items-center justify-center space-y-3">
        {currentPair.length === 0 ? (
          <span className="bg-blue-50 text-blue-800 px-6 py-2 rounded-full font-bold border border-blue-200 shadow-sm text-lg">
            Possiveis combinacoes sem repeticao na urna: {drawStats.validCombinations}
          </span>
        ) : currentPair.length === 1 ? (
          <span className="bg-indigo-50 text-indigo-800 px-6 py-2 rounded-full font-bold border border-indigo-200 shadow-sm text-lg">
            Parceiros sem repeticao disponiveis para {currentPair[0]}: {drawStats.validPartnersForCurrent}
          </span>
        ) : null}

        {drawStats.repeatedPairsNeeded > 0 && currentPair.length < 2 && (
          <span className="bg-red-50 text-red-600 px-6 py-2 rounded-full font-bold border border-red-200 shadow-sm animate-pulse text-lg">
            Atencao: Sem combinacoes suficientes. {drawStats.repeatedPairsNeeded} {drawStats.repeatedPairsNeeded === 1 ? 'dupla tera' : 'duplas terao'} que ser repetida!
          </span>
        )}
      </div>
      
      <div className="flex justify-center items-center space-x-6 mb-10 h-40">
        {currentPair.length >= 1 ? (
           <div className="bg-brandRed text-white text-4xl font-bold py-8 px-12 rounded-xl shadow-md border-4 border-brandGold">
             {currentPair[0]}
           </div>
        ) : (
           <div className="bg-gray-100 text-gray-400 text-2xl font-bold py-8 px-12 rounded-xl border-4 border-dashed border-gray-300">
             Aguardando
           </div>
        )}
        
        <div className="text-4xl font-black text-brandGold">&</div>
        
        {currentPair.length === 2 ? (
           <div className="bg-brandRed text-white text-4xl font-bold py-8 px-12 rounded-xl shadow-md border-4 border-brandGold">
             {currentPair[1]}
           </div>
        ) : (
           <div className="bg-gray-100 text-gray-400 text-2xl font-bold py-8 px-12 rounded-xl border-4 border-dashed border-gray-300">
             Aguardando
           </div>
        )}
      </div>

      {renderDrawButtons()}

      <div className="mt-16 text-left">
        <h3 className="text-xl font-bold border-b pb-2 mb-4 text-gray-600">Partidas da Sessao Atual</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sessionPairs.map((pair, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200 text-center font-bold text-lg shadow-sm">
              <span className="text-brandRed">{pair.player1}</span> <span className="text-gray-400 mx-1">x</span> <span className="text-brandRed">{pair.player2}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}