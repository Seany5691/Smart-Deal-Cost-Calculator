import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import { useCalculatorStore } from './store/calculator';
import { useOfflineStore } from './store/offline';
import Test from './Test';
import SimpleTest from './SimpleTest';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import Documentation from './pages/Documentation';

// Components
import OfflineAlert from './components/common/OfflineAlert';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

function App() {
  const { isAuthenticated } = useAuthStore();
  const { initializeStore } = useCalculatorStore();
  const { setOnlineStatus, isOnline } = useOfflineStore();
  const [isInitialized, setIsInitialized] = useState(false);

  console.log('App rendering, auth state:', { isAuthenticated });

  // Initialize the calculator store
  useEffect(() => {
    const init = async () => {
      try {
        await initializeStore();
        setIsInitialized(true);
        console.log('Store initialized successfully');
      } catch (error) {
        console.error('Error initializing store:', error);
        setIsInitialized(true); // Still set to true so we can show the UI
      }
    };
    init();
  }, [initializeStore]);

  // Set up online/offline detection
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <span className="inline-block w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></span>
          <div className="mt-4">Loading application...</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Logo in top-left corner */}
        <div className="fixed top-4 left-4 z-50">
          <img src="/logo.png" alt="Smart Deal Cost Calculator" className="h-10" />
        </div>

        {/* Offline alert */}
        {!isOnline && <OfflineAlert />}

        {/* Debug info - can be removed in production */}
        <div className="fixed top-4 right-4 bg-white p-2 border rounded shadow z-50">
          <div>Auth: {isAuthenticated ? 'Yes' : 'No'}</div>
          <div>Online: {isOnline ? 'Yes' : 'No'}</div>
        </div>

        {/* Main content */}
        <div className="flex-1 pt-16">
          <Routes>
            <Route path="/test" element={<Test />} />
            <Route path="/simple" element={<SimpleTest />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/calculator" element={<ProtectedRoute><Calculator /></ProtectedRoute>} />
            <Route path="/documentation" element={<ProtectedRoute><Documentation /></ProtectedRoute>} />
            <Route path="/admin/*" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
