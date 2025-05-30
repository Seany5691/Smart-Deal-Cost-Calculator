import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(username, password);
      
      if (success) {
        setSuccess('Login successful!');
        navigate('/');
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      setError('An error occurred during login');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-12 md:py-24 px-4 sm:px-8">
      <div className="space-y-8">
        <div className="space-y-6 text-center">
          <img src="/logo.png" alt="Smart Deal Cost Calculator" className="h-16 mx-auto" />
          <div className="space-y-2 md:space-y-3 text-center">
            <h1 className="text-3xl font-bold">Log in to your account</h1>
            <p className="text-gray-500">Enter your credentials to access the calculator</p>
          </div>
        </div>

        <div className="py-0 sm:py-8 px-4 sm:px-10 bg-transparent sm:bg-white sm:shadow-md sm:rounded-xl">
          {error && (
            <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-success-50 text-success-700 rounded-md">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="space-y-5">
                <div className="form-group">
                  <label htmlFor="username" className="label">Username</label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="label">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full py-3 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
