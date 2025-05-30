import { useState, useEffect } from 'react';
import { useCalculatorStore } from '@/store/calculator';
import { Scales } from '@/lib/types';
import { formatCurrency } from '@/utils';

interface ScalesConfigProps {
  scales: Scales;
  onOfflineChange: (data: Scales) => void;
}

const ScalesConfig = ({ scales, onOfflineChange }: ScalesConfigProps) => {
  const [localScales, setLocalScales] = useState<Scales>({
    installation: { '0-4': 0, '5-8': 0, '9-16': 0, '17-32': 0, '33+': 0 },
    finance_fee: { '0-20000': 0, '20001-50000': 0, '50001-100000': 0, '100001+': 0 },
    gross_profit: { '0-4': 0, '5-8': 0, '9-16': 0, '17-32': 0, '33+': 0 },
    additional_costs: { cost_per_kilometer: 0, cost_per_point: 0 },
  });
  const { updateScales } = useCalculatorStore();
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

  // Initialize local scales from props
  useEffect(() => {
    if (scales) {
      setLocalScales(scales);
    }
  }, [scales]);

  // Handle scale value change
  const handleScaleChange = (
    category: keyof Scales,
    key: string,
    value: number
  ) => {
    setLocalScales((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  // Handle additional cost change
  const handleAdditionalCostChange = (key: string, value: number) => {
    setLocalScales((prev) => ({
      ...prev,
      additional_costs: {
        ...prev.additional_costs,
        [key]: value,
      },
    }));
  };

  // Save scales to store and API
  const handleSave = async () => {
    try {
      const success = await updateScales(localScales);
      
      if (success) {
        onOfflineChange(localScales);
        setToast({
          show: true,
          title: 'Success',
          message: 'Scales and costs updated successfully',
          type: 'success'
        });
      } else {
        setToast({
          show: true,
          title: 'Error',
          message: 'Failed to update scales and costs',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving scales:', error);
      setToast({
        show: true,
        title: 'Error',
        message: 'An error occurred while saving',
        type: 'error'
      });
    }
  };

  return (
    <div>
      {/* Toast notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${toast.type === 'error' ? 'bg-error-50 text-error-700' : toast.type === 'warning' ? 'bg-warning-50 text-warning-700' : toast.type === 'info' ? 'bg-blue-50 text-blue-700' : 'bg-success-50 text-success-700'}`}>
          <div className="font-bold">{toast.title}</div>
          <div>{toast.message}</div>
        </div>
      )}
      
      <h2 className="text-lg font-semibold mb-4">
        Scales & Costs Configuration
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Installation Scales */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-md font-medium text-gray-900">Installation Scales</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(localScales.installation).map(([key, value]) => (
                <div key={`installation-${key}`} className="form-group">
                  <label className="label">{key} Extensions</label>
                  <input
                    type="number"
                    className="input"
                    value={value}
                    onChange={(e) => handleScaleChange('installation', key, parseFloat(e.target.value) || 0)}
                    min="0"
                    step="1"
                  />
                  <div className="text-sm text-gray-600 mt-1">
                    {formatCurrency(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Finance Fee Scales */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-md font-medium text-gray-900">Finance Fee Scales</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(localScales.finance_fee).map(([key, value]) => (
                <div key={`finance-${key}`} className="form-group">
                  <label className="label">{key} Rand</label>
                  <input
                    type="number"
                    className="input"
                    value={value}
                    onChange={(e) => handleScaleChange('finance_fee', key, parseFloat(e.target.value) || 0)}
                    min="0"
                    step="1"
                  />
                  <div className="text-sm text-gray-600 mt-1">
                    {formatCurrency(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gross Profit Scales */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-md font-medium text-gray-900">Gross Profit Scales</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(localScales.gross_profit).map(([key, value]) => (
                <div key={`profit-${key}`} className="form-group">
                  <label className="label">{key} Extensions</label>
                  <input
                    type="number"
                    className="input"
                    value={value}
                    onChange={(e) => handleScaleChange('gross_profit', key, parseFloat(e.target.value) || 0)}
                    min="0"
                    step="1"
                  />
                  <div className="text-sm text-gray-600 mt-1">
                    {formatCurrency(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Costs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-md font-medium text-gray-900">Additional Costs</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="form-group">
                <label className="label">Cost per Kilometer</label>
                <input
                  type="number"
                  className="input"
                  value={localScales.additional_costs.cost_per_kilometer}
                  onChange={(e) => handleAdditionalCostChange('cost_per_kilometer', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
                <div className="text-sm text-gray-600 mt-1">
                  {formatCurrency(localScales.additional_costs.cost_per_kilometer)}
                </div>
              </div>
              <div className="form-group">
                <label className="label">Cost per Extension Point</label>
                <input
                  type="number"
                  className="input"
                  value={localScales.additional_costs.cost_per_point}
                  onChange={(e) => handleAdditionalCostChange('cost_per_point', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
                <div className="text-sm text-gray-600 mt-1">
                  {formatCurrency(localScales.additional_costs.cost_per_point)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button 
        className="btn btn-primary text-lg py-2 px-4" 
        onClick={handleSave}
      >
        Save All Changes
      </button>
    </div>
  );
};

export default ScalesConfig;
