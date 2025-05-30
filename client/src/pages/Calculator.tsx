import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCalculatorStore } from '@/store/calculator';

// Calculator components
import DealDetailsSection from '@/components/calculator/DealDetailsSection';
import HardwareSection from '@/components/calculator/HardwareSection';
import ConnectivitySection from '@/components/calculator/ConnectivitySection';
import LicensingSection from '@/components/calculator/LicensingSection';
import SettlementSection from '@/components/calculator/SettlementSection';
import TotalCostsSection from '@/components/calculator/TotalCostsSection';

const Calculator = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const { initializeStore } = useCalculatorStore();
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

  // Initialize calculator store
  useEffect(() => {
    const init = async () => {
      await initializeStore();
    };
    init();
  }, [initializeStore]);

  // Handle tab change
  const handleTabChange = (index: number) => {
    setTabIndex(index);
  };

  // Handle navigation to next tab
  const handleNextTab = () => {
    if (tabIndex < 5) {
      setTabIndex(tabIndex + 1);
    }
  };

  // Handle navigation to previous tab
  const handlePrevTab = () => {
    if (tabIndex > 0) {
      setTabIndex(tabIndex - 1);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Toast notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${toast.type === 'error' ? 'bg-error-50 text-error-700' : toast.type === 'warning' ? 'bg-warning-50 text-warning-700' : 'bg-success-50 text-success-700'}`}>
          <div className="font-bold">{toast.title}</div>
          <div>{toast.message}</div>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Deal Cost Calculator</h1>
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
              {['Deal Details', 'Hardware', 'Connectivity', 'Licensing', 'Settlement', 'Total Costs'].map((tab, index) => (
                <button
                  key={index}
                  className={`py-4 px-4 font-medium text-sm ${tabIndex === index ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => handleTabChange(index)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-0">
            {tabIndex === 0 && (
              <DealDetailsSection onNext={handleNextTab} />
            )}
            {tabIndex === 1 && (
              <HardwareSection onNext={handleNextTab} onPrev={handlePrevTab} />
            )}
            {tabIndex === 2 && (
              <ConnectivitySection onNext={handleNextTab} onPrev={handlePrevTab} />
            )}
            {tabIndex === 3 && (
              <LicensingSection onNext={handleNextTab} onPrev={handlePrevTab} />
            )}
            {tabIndex === 4 && (
              <SettlementSection onNext={handleNextTab} onPrev={handlePrevTab} />
            )}
            {tabIndex === 5 && (
              <TotalCostsSection onPrev={handlePrevTab} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
