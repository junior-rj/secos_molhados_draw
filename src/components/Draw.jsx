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
            <div className="bg-yellow-100 border border-yellow-400 p-6 rounded-lg text-center max-w-3xl shadow-md">
                <p className="text-yellow-800 font-bold text-2xl mb-4">Aviso: Esta dupla ja jogou junta no passado.</p>
                <p className="text-yellow-900 text-lg font-medium leading-relaxed">
                  Avaliando os jogadores que ainda estao na urna existem <strong className="text-xl text-green-700">{drawStats.uniqueAvailable}</strong> combinacoes ineditas disponiveis e <strong className="text-xl text-red-700">{drawStats.alreadyPlayed}</strong> combinacoes que ja se repetiram. Deseja confirmar essa dupla mesmo assim ou recusar para sortear novamente?
                </p>
            </div>
            <div className="flex space-x-4 mt-4">
              <button onClick={confirmPair} className="bg-yellow-600 text-white text-xl font-bold py-4 px-10 rounded shadow hover:bg-yellow-700 transition duration-300">
                Confirmar Dupla Repetida
              </button>
              <button onClick={cancelPair} className="bg-red-600 text-white text-xl font-bold py-4 px-10 rounded shadow hover:bg-red-700 transition duration-300">
                Recusar e Sortear Novamente
              </button>
            </div>
          </div>
        );
      } else {
        return (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-green-600 font-bold mb-2 text-xl">Dupla inedita e valida para a sessao.</p>
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

      <div className="mb-8 flex justify-center">
         <div className="bg-blue-50 text-blue-900 px-6 py-4 rounded-lg font-medium border border-blue-200 shadow-sm text-lg flex flex-col md:flex-row md:space-x-4 items-center">
            <span>Combinacoes totais: <strong className="font-black">{drawStats.totalPossible}</strong></span>
            <span className="hidden md:inline">|</span>
            <span>Ja jogaram juntas: <strong className="font-black">{drawStats.alreadyPlayed}</strong></span>
            <span className="hidden md:inline">|</span>
            <span>Ineditas disponiveis: <strong className="font-black text-green-700">{drawStats.uniqueAvailable}</strong></span>
         </div>
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