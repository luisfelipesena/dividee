'use client';

import { useState, type ChangeEvent } from 'react';
import { add, subtract, multiply, divide } from '@dividee/core';

export default function HomePage() {
  const [num1, setNum1] = useState<string>('');
  const [num2, setNum2] = useState<string>('');
  const [operation, setOperation] = useState<string>('+');
  const [result, setResult] = useState<number | string>('');

  const handleCalculate = () => {
    const n1 = Number.parseFloat(num1);
    const n2 = Number.parseFloat(num2);

    if (Number.isNaN(n1) || Number.isNaN(n2)) {
      setResult('Invalid input');
      return;
    }

    try {
      switch (operation) {
        case '+':
          setResult(add(n1, n2));
          break;
        case '-':
          setResult(subtract(n1, n2));
          break;
        case '*':
          setResult(multiply(n1, n2));
          break;
        case '/':
          setResult(divide(n1, n2));
          break;
        default:
          setResult('Invalid operation');
      }
    } catch (error) {
      if (error instanceof Error) {
        setResult(error.message);
      } else {
        setResult('An unknown error occurred');
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">Web Calculator</h1>
        <div className="grid grid-cols-1 gap-4 mb-4">
          <input
            type="number"
            value={num1}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNum1(e.target.value)}
            placeholder="Number 1"
            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <select 
            value={operation} 
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setOperation(e.target.value)}
            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
          >
            <option value="+">+</option>
            <option value="-">-</option>
            <option value="*">*</option>
            <option value="/">/</option>
          </select>
          <input
            type="number"
            value={num2}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNum2(e.target.value)}
            placeholder="Number 2"
            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <button 
          onClick={handleCalculate} 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md transition duration-150 ease-in-out mb-6"
        >
          Calculate
        </button>
        {result !== '' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 text-center">Result: <span className="font-bold text-blue-600">{result}</span></h2>
          </div>
        )}
      </div>
    </main>
  );
}
