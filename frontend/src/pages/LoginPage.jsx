import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <--- UPDATED IMPORT
import { toast } from 'react-toastify';
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowRight, Loader } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth(); // <--- UPDATED HOOK
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // 1. Call login and wait for the result object
    const result = await login(email, password);

    if (result.success) {
      toast.success('Welcome back!');
      
      // 2. SMART REDIRECT: Segregate Admin vs User
      if (result.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/login');
      }
    } else {
      toast.error(result.message || 'Invalid credentials');
      setLoading(false);
    }
  };

  return (
    // 'fixed inset-0' makes it cover the whole screen.
    // 'z-[100]' ensures it sits ON TOP of your existing Navbar.
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-50 px-4">
      
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-fade-in-up">
            <div className="mb-8 text-center">
                <div className="inline-block p-3 rounded-full bg-green-100 text-green-600 mb-4">
                    <LogIn className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-gray-500 mt-2">Sign in to GreenSort</p>
            </div>

            <form onSubmit={submitHandler} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-green-500" />
                        </div>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-500" />
                        </div>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full flex justify-center items-center py-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                    {loading ? <Loader className="animate-spin" /> : <>Sign In <ArrowRight className="ml-2 w-5 h-5" /></>}
                </button>
            </form>

            <p className="mt-8 text-center text-gray-600">
                New here?{' '}
                <Link to="/register" className="text-green-600 font-bold hover:underline">
                    Create an account
                </Link>
            </p>
      </div>
    </div>
  );
};

export default LoginPage;