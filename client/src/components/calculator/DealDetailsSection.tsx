import { useState, useEffect } from 'react';
import { useCalculatorStore } from '@/store/calculator';

interface DealDetailsSectionProps {
  onNext: () => void;
}

const DealDetailsSection = ({ onNext }: DealDetailsSectionProps) => {
  const { dealDetails, updateDealDetails } = useCalculatorStore();
  const [customerName, setCustomerName] = useState(dealDetails.customerName || '');
  const [distanceToInstall, setDistanceToInstall] = useState(dealDetails.distanceToInstall || 0);
  const [term, setTerm] = useState(dealDetails.term || 60);
  const [escalation, setEscalation] = useState(dealDetails.escalation || 0);
  const [additionalGrossProfit, setAdditionalGrossProfit] = useState(
    dealDetails.additionalGrossProfit || 0
  );
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: '' });
  
  // Auto-hide toast after specified duration
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Update local state when store changes
  useEffect(() => {
    setCustomerName(dealDetails.customerName || '');
    setDistanceToInstall(dealDetails.distanceToInstall || 0);
    setTerm(dealDetails.term || 60);
    setEscalation(dealDetails.escalation || 0);
    setAdditionalGrossProfit(dealDetails.additionalGrossProfit || 0);
  }, [dealDetails]);

  // Save deal details to store
  const handleSave = () => {
    updateDealDetails({
      customerName,
      distanceToInstall,
      term,
      escalation,
      additionalGrossProfit,
    });

    setToast({
      show: true,
      title: 'Success',
      message: 'Deal details saved',
      type: 'success'
    });

    onNext();
  };

  return (
    <div className="p-4">
      {/* Toast notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${toast.type === 'error' ? 'bg-error-50 text-error-700' : toast.type === 'warning' ? 'bg-warning-50 text-warning-700' : 'bg-success-50 text-success-700'}`}>
          <div className="font-bold">{toast.title}</div>
          <div>{toast.message}</div>
        </div>
      )}
      
      <h2 className="text-lg font-bold mb-6">
        Deal Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="form-group">
          <label className="label" htmlFor="customerName">
            Customer Name <span className="text-red-500">*</span>
          </label>
          <input
            id="customerName"
            className="input"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
            required
          />
        </div>

        <div className="form-group">
          <label className="label" htmlFor="distanceToInstall">
            Distance to Installation (km)
          </label>
          <div className="relative">
            <input
              id="distanceToInstall"
              type="number"
              className="input"
              value={distanceToInstall}
              onChange={(e) => setDistanceToInstall(parseFloat(e.target.value) || 0)}
              min={0}
              step={0.1}
            />
            <div className="absolute inset-y-0 right-0 flex">
              <div className="flex flex-col">
                <button 
                  className="h-1/2 px-2 bg-gray-200 hover:bg-gray-300 border border-gray-300" 
                  onClick={() => setDistanceToInstall(prev => prev + 0.1)}
                >
                  <span className="text-xs">▲</span>
                </button>
                <button 
                  className="h-1/2 px-2 bg-gray-200 hover:bg-gray-300 border border-gray-300" 
                  onClick={() => setDistanceToInstall(prev => Math.max(0, prev - 0.1))}
                >
                  <span className="text-xs">▼</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="label" htmlFor="term">
            Term (months)
          </label>
          <select
            id="term"
            className="select"
            value={term}
            onChange={(e) => setTerm(parseInt(e.target.value))}
          >
            <option value={36}>36 Months</option>
            <option value={48}>48 Months</option>
            <option value={60}>60 Months</option>
          </select>
        </div>

        <div className="form-group">
          <label className="label" htmlFor="escalation">
            Escalation (%)
          </label>
          <select
            id="escalation"
            className="select"
            value={escalation}
            onChange={(e) => setEscalation(parseInt(e.target.value))}
          >
            <option value={0}>0%</option>
            <option value={5}>5%</option>
            <option value={10}>10%</option>
            <option value={15}>15%</option>
          </select>
        </div>

        <div className="form-group">
          <label className="label" htmlFor="additionalGrossProfit">
            Additional Gross Profit (R)
          </label>
          <div className="relative">
            <input
              id="additionalGrossProfit"
              type="number"
              className="input"
              value={additionalGrossProfit}
              onChange={(e) => setAdditionalGrossProfit(parseFloat(e.target.value) || 0)}
              min={0}
              step={0.01}
            />
            <div className="absolute inset-y-0 right-0 flex">
              <div className="flex flex-col">
                <button 
                  className="h-1/2 px-2 bg-gray-200 hover:bg-gray-300 border border-gray-300" 
                  onClick={() => setAdditionalGrossProfit(prev => prev + 1)}
                >
                  <span className="text-xs">▲</span>
                </button>
                <button 
                  className="h-1/2 px-2 bg-gray-200 hover:bg-gray-300 border border-gray-300" 
                  onClick={() => setAdditionalGrossProfit(prev => Math.max(0, prev - 1))}
                >
                  <span className="text-xs">▼</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          className={`btn flex items-center ${!customerName ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
          onClick={handleSave}
          disabled={!customerName}
        >
          Next: Hardware
          <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
};

export default DealDetailsSection;
