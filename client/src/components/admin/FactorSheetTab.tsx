import { useState, useEffect } from 'react';
import { useCalculatorStore } from '@/store/calculator';
import { FactorData } from '@/lib/types';
import { MdSave, MdRefresh } from 'react-icons/md';

interface FactorSheetTabProps {
  onOfflineChange: (data: any) => void;
}

const FactorSheetTab = ({ onOfflineChange }: FactorSheetTabProps) => {
  const { factors, updateFactors } = useCalculatorStore();
  const [localFactors, setLocalFactors] = useState<FactorData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: '' });
  const [selectedTerm, setSelectedTerm] = useState('36_months');
  const [selectedEscalation, setSelectedEscalation] = useState('0%');

  // Initialize local factors from store
  useEffect(() => {
    setLocalFactors(JSON.parse(JSON.stringify(factors)));
  }, [factors]);

  // Auto-hide toast after specified duration
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleFactorChange = (term: string, escalation: string, financeRange: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    const updatedFactors = { ...localFactors };
    
    if (!updatedFactors[term]) {
      updatedFactors[term] = {};
    }
    
    if (!updatedFactors[term][escalation]) {
      updatedFactors[term][escalation] = {};
    }
    
    updatedFactors[term][escalation][financeRange] = numValue;
    setLocalFactors(updatedFactors);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Log the factors being saved
      console.log('Saving factors to server:', JSON.stringify(localFactors));
      
      const success = await updateFactors(localFactors);
      console.log('Update result:', success);
      
      if (success) {
        console.log('Factors updated successfully');
        setToast({
          show: true,
          title: 'Success',
          message: 'Factors updated successfully',
          type: 'success'
        });
      } else {
        console.log('Failed to update factors');
        setToast({
          show: true,
          title: 'Error',
          message: 'Failed to update factors',
          type: 'error'
        });
        onOfflineChange(localFactors);
      }
    } catch (error) {
      console.error('Error updating factors:', error);
      setToast({
        show: true,
        title: 'Error',
        message: 'Failed to update factors',
        type: 'error'
      });
      onOfflineChange(localFactors);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setLocalFactors(JSON.parse(JSON.stringify(factors)));
    setToast({
      show: true,
      title: 'Reset',
      message: 'Changes discarded',
      type: 'info'
    });
  };

  const renderFactorTable = () => {
    const termOptions = Object.keys(localFactors);
    const escalationOptions = localFactors[selectedTerm] ? Object.keys(localFactors[selectedTerm]) : [];
    
    return (
      <div>
        <div className="mb-4 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
            <select 
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
            >
              {termOptions.map(term => (
                <option key={term} value={term}>
                  {term.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escalation</label>
            <select 
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
              value={selectedEscalation}
              onChange={(e) => setSelectedEscalation(e.target.value)}
            >
              {escalationOptions.map(escalation => (
                <option key={escalation} value={escalation}>
                  {escalation}
                </option>
              ))}
            </select>
          </div>
        </div>

        {localFactors[selectedTerm] && localFactors[selectedTerm][selectedEscalation] && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Finance Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Factor Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(localFactors[selectedTerm][selectedEscalation]).map(([financeRange, factor]) => (
                  <tr key={financeRange}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {financeRange}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.00001"
                        min="0"
                        className="border border-gray-300 rounded-md px-3 py-2 w-32"
                        value={factor}
                        onChange={(e) => handleFactorChange(selectedTerm, selectedEscalation, financeRange, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
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
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Factor Sheet</h2>
        <div className="flex space-x-2">
          <button
            className="btn btn-outline flex items-center"
            onClick={handleReset}
            disabled={isLoading}
          >
            <MdRefresh className="mr-1" />
            Reset
          </button>
          <button
            className="btn btn-primary flex items-center"
            onClick={handleSave}
            disabled={isLoading}
          >
            <MdSave className="mr-1" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <p className="mb-4 text-gray-600">
          These factors are used to calculate the monthly rental amount based on the term, escalation, and finance amount.
          The factor is multiplied by the total payout to determine the monthly hardware rental.
        </p>
        
        {renderFactorTable()}
      </div>
    </div>
  );
};

export default FactorSheetTab;
