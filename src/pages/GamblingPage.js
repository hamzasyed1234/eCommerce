import React, { useState } from 'react';

const GamblingPage = ({ onRollDice }) => {
  const [betAmount, setBetAmount] = useState('');
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [diceResult, setDiceResult] = useState(null);
  const [gamblingMessage, setGamblingMessage] = useState('');

  const handleRoll = () => {
    const result = onRollDice(betAmount, selectedNumber);
    if (result) {
      setDiceResult(result.roll);
      setGamblingMessage(result.message);
      setBetAmount('');
    } else {
      setGamblingMessage('Please enter a valid bet amount!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">🎲 Dice Gambling</h2>
        <p className="text-center text-gray-600 mb-8">
          Pick a number (1-6), place your bet, and roll! Win 5x your bet if you guess correctly!
        </p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Your Number
            </label>
            <div className="grid grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => setSelectedNumber(num)}
                  className={`py-4 rounded-lg font-bold text-xl transition ${
                    selectedNumber === num
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bet Amount ($)
            </label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Enter bet amount"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleRoll}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition"
          >
            🎲 Roll the Dice!
          </button>

          {diceResult !== null && (
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="text-6xl font-bold mb-4">🎲 {diceResult}</div>
              <p className={`text-xl font-bold ${
                gamblingMessage.includes('won') ? 'text-green-600' : 'text-red-600'
              }`}>
                {gamblingMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamblingPage;