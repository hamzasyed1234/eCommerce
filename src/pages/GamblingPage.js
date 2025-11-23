import React, { useState } from 'react';
import { apiFetch } from '../api';

const GamblingPage = ({ currentUser }) => {
  const [betAmount, setBetAmount] = useState('');
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [diceResult, setDiceResult] = useState(null);
  const [message, setMessage] = useState('');

  const handleRoll = async () => {
    try {
      const result = await apiFetch('/gamble', 'POST', { bet: betAmount, number: selectedNumber }, currentUser.token);
      setDiceResult(result.roll);
      setMessage(result.message);
      setBetAmount('');
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">🎲 Dice Gambling</h2>
        <p className="text-center text-gray-600 mb-8">Pick a number (1-6), place your bet, and roll! Win 5x your bet if correct!</p>

        <div className="space-y-6">
          <div>
            <label className="block mb-2">Select Your Number</label>
            <div className="grid grid-cols-6 gap-3">
              {[1,2,3,4,5,6].map(num => (
                <button
                  key={num}
                  onClick={() => setSelectedNumber(num)}
                  className={`py-4 rounded-lg font-bold transition ${selectedNumber === num ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >{num}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-2">Bet Amount ($)</label>
            <input
              type="number"
              value={betAmount}
              onChange={e => setBetAmount(e.target.value)}
              placeholder="Enter bet amount"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleRoll}
            className="w-full bg-purple-600 text-white py-4 rounded-lg font-bold hover:bg-purple-700 transition"
          >
            🎲 Roll the Dice!
          </button>

          {diceResult !== null && (
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="text-6xl font-bold mb-4">🎲 {diceResult}</div>
              <p className={`text-xl font-bold ${message.includes('won') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamblingPage;
