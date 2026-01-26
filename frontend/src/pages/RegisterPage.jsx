import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { UserPlus } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      toast.success('Registration Successful!');
      navigate('/'); // Redirect to home
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration Failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-off-white px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <UserPlus className="w-12 h-12 text-recycle-green mx-auto mb-2" />
          <h2 className="text-3xl font-bold text-charcoal">Join GreenSort</h2>
          <p className="text-gray-500">Create an account to track your impact.</p>
        </div>

        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-recycle-green focus:ring-2 focus:ring-recycle-green/20 outline-none transition"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-recycle-green focus:ring-2 focus:ring-recycle-green/20 outline-none transition"
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-recycle-green focus:ring-2 focus:ring-recycle-green/20 outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="w-full bg-recycle-green text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md">
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-recycle-green font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;