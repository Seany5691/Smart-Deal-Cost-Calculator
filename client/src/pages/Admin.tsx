import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { useCalculatorStore } from '@/store/calculator';
import { useOfflineStore } from '@/store/offline';

// Admin components
import UserManagement from '@/components/admin/UserManagement';
import HardwareConfig from '@/components/admin/HardwareConfig';
import ConnectivityConfig from '@/components/admin/ConnectivityConfig';
import LicensingConfig from '@/components/admin/LicensingConfig';
import ScalesConfig from '@/components/admin/ScalesConfig';
import FactorSheetTab from '@/components/admin/FactorSheetTab';

const Admin = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const { user } = useAuthStore();
  const { scales, initializeStore } = useCalculatorStore();
  const { isOnline, addPendingChange } = useOfflineStore();
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: '' });
  
  // Auto-hide toast after specified duration
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Initialize calculator store if needed
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Handle offline mode
  const handleOfflineChange = (type: 'scales' | 'hardware' | 'connectivity' | 'licensing', data: any) => {
    if (!isOnline) {
      addPendingChange(type, data);
      setToast({
        show: true,
        title: 'Offline Mode',
        message: 'Changes saved locally and will sync when you\'re back online.',
        type: 'info'
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Toast notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${toast.type === 'error' ? 'bg-error-50 text-error-700' : toast.type === 'warning' ? 'bg-warning-50 text-warning-700' : toast.type === 'info' ? 'bg-blue-50 text-blue-700' : 'bg-success-50 text-success-700'}`}>
          <div className="font-bold">{toast.title}</div>
          <div>{toast.message}</div>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <Link 
          to="/"
          className="btn btn-outline flex items-center text-blue-500 border-blue-500 hover:bg-blue-50"
        >
          <span className="mr-2">←</span>
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="w-full">
          {/* Tabs */}
          <div className="border-b">
            <div className="flex px-4">
              {['User Management', 'Hardware', 'Connectivity', 'Licensing', 'Scales & Costs', 'Factor Sheet'].map((tab, index) => (
                <button
                  key={index}
                  className={`py-4 px-4 font-medium text-sm ${tabIndex === index ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setTabIndex(index)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {tabIndex === 0 && (
              <UserManagement />
            )}
            {tabIndex === 1 && (
              <HardwareConfig onOfflineChange={(data) => handleOfflineChange('hardware', data)} />
            )}
            {tabIndex === 2 && (
              <ConnectivityConfig onOfflineChange={(data) => handleOfflineChange('connectivity', data)} />
            )}
            {tabIndex === 3 && (
              <LicensingConfig onOfflineChange={(data) => handleOfflineChange('licensing', data)} />
            )}
            {tabIndex === 4 && (
              <ScalesConfig 
                scales={scales} 
                onOfflineChange={(data) => handleOfflineChange('scales', data)} 
              />
            )}
            {tabIndex === 5 && (
              <FactorSheetTab 
                onOfflineChange={(data) => handleOfflineChange('factors', data)} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
