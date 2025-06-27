import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard({ token }) {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('expense');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(res.data);
      } catch (err) {
        setError('Failed to fetch transactions');
      }
    };
    fetchTransactions();
  }, [token]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/transactions`,
        { amount: Number(amount), category, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTransactions([...transactions, res.data]);
      setAmount('');
      setCategory('');
      setType('expense');
    } catch (err) {
      setError('Failed to add transaction');
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(transactions.filter((t) => t._id !== id));
    } catch (err) {
      setError('Failed to delete transaction');
    }
  };

  // Calculate totals
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const data = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        data: [income, expenses],
        backgroundColor: ['#4ade80', '#f87171'],
        hoverOffset: 6,
      },
    ],
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleAddTransaction} className="space-y-4 mb-8">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Transaction
        </button>
      </form>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Transactions</h2>
        {transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((t) => (
              <li
                key={t._id}
                className="flex justify-between items-center bg-gray-100 p-3 rounded"
              >
                <span>
                  ₹{t.amount} - {t.category} ({t.type})
                </span>
                <button
                  onClick={() => handleDeleteTransaction(t._id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="max-w-xs mx-auto">
        <Pie data={data} />
      </div>
    </div>
  );
}

export default Dashboard;
