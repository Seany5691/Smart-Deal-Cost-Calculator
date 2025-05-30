import { useState, useEffect } from 'react';
import { useCalculatorStore } from '@/store/calculator';
import { formatCurrency } from '@/utils';
import { TotalCosts } from '@/lib/types';
import GeneratePDFButton from '@/components/calculator/GeneratePDFButton';
import GenerateProposalButton from '@/components/calculator/GenerateProposalButton';
import GenerateDealPackButton from '@/components/calculator/GenerateDealPackButton';

interface TotalCostsSectionProps {
  onPrev: () => void;
}

const TotalCostsSection = ({ onPrev }: TotalCostsSectionProps) => {
  const { calculateTotalCosts, dealDetails } = useCalculatorStore();
  const [totals, setTotals] = useState<TotalCosts>({
    extensionCount: 0,
    hardwareTotal: 0,
    hardwareInstallTotal: 0,
    baseGrossProfit: 0,
    additionalProfit: 0,
    totalGrossProfit: 0,
    financeFee: 0,
    settlementAmount: 0,
    financeAmount: 0,
    totalPayout: 0,
    hardwareRental: 0,
    connectivityCost: 0,
    licensingCost: 0,
    totalMRC: 0,
    totalExVat: 0,
    totalIncVat: 0,
    factorUsed: 0,
  });
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

  // Calculate totals when component mounts or dealDetails changes
  useEffect(() => {
    const calculatedTotals = calculateTotalCosts();
    setTotals(calculatedTotals);
  }, [calculateTotalCosts, dealDetails]);

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
        Total Costs Summary
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b p-4">
            <h3 className="text-md font-semibold">Hardware & Installation</h3>
          </div>
          <div className="p-4">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2">Number of Extensions</td>
                  <td className="py-2 text-right">{totals.extensionCount}</td>
                </tr>
                <tr>
                  <td className="py-2">Hardware Total</td>
                  <td className="py-2 text-right">{formatCurrency(totals.hardwareTotal)}</td>
                </tr>
                <tr>
                  <td className="py-2">Extension Cost ({totals.extensionCount} × Cost per Extension Point)</td>
                  <td className="py-2 text-right">{formatCurrency(totals.extensionCount * useCalculatorStore.getState().scales.additional_costs.cost_per_point)}</td>
                </tr>
                <tr>
                  <td className="py-2">Hardware & Installation Total</td>
                  <td className="py-2 text-right">{formatCurrency(totals.hardwareInstallTotal)}</td>
                </tr>
                <tr>
                  <td className="py-2">Base Gross Profit</td>
                  <td className="py-2 text-right">{formatCurrency(totals.baseGrossProfit)}</td>
                </tr>
                <tr>
                  <td className="py-2">Additional Profit</td>
                  <td className="py-2 text-right">{formatCurrency(totals.additionalProfit)}</td>
                </tr>
                <tr>
                  <td className="py-2">Total Gross Profit</td>
                  <td className="py-2 text-right">{formatCurrency(totals.totalGrossProfit)}</td>
                </tr>
                <tr>
                  <td className="py-2">Finance Fee</td>
                  <td className="py-2 text-right">{formatCurrency(totals.financeFee)}</td>
                </tr>
                <tr>
                  <td className="py-2">Settlement Amount</td>
                  <td className="py-2 text-right">{formatCurrency(totals.settlementAmount)}</td>
                </tr>
                <tr className="font-bold">
                  <td className="py-2">Finance Amount</td>
                  <td className="py-2 text-right">{formatCurrency(totals.financeAmount)}</td>
                </tr>
                <tr className="font-bold">
                  <td className="py-2">Total Payout</td>
                  <td className="py-2 text-right">{formatCurrency(totals.totalPayout)}</td>
                </tr>
                <tr>
                  <td className="py-2">Factor Used</td>
                  <td className="py-2 text-right">{totals.factorUsed.toFixed(5)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b p-4">
            <h3 className="text-md font-semibold">Monthly Recurring Costs</h3>
          </div>
          <div className="p-4">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2">Hardware Rental</td>
                  <td className="py-2 text-right">{formatCurrency(totals.hardwareRental)}</td>
                </tr>
                <tr>
                  <td className="py-2">Connectivity Cost</td>
                  <td className="py-2 text-right">{formatCurrency(totals.connectivityCost)}</td>
                </tr>
                <tr>
                  <td className="py-2">Licensing Cost</td>
                  <td className="py-2 text-right">{formatCurrency(totals.licensingCost)}</td>
                </tr>
                <tr className="font-bold">
                  <td className="py-2">Total MRC</td>
                  <td className="py-2 text-right">{formatCurrency(totals.totalMRC)}</td>
                </tr>
                <tr>
                  <td className="py-2">Total Ex VAT</td>
                  <td className="py-2 text-right">{formatCurrency(totals.totalExVat)}</td>
                </tr>
                <tr className="font-bold">
                  <td className="py-2">Total Inc VAT (15%)</td>
                  <td className="py-2 text-right">{formatCurrency(totals.totalIncVat)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="border-b p-4">
          <h3 className="text-md font-semibold">Deal Information</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="font-bold">Customer Name</p>
              <p>{dealDetails.customerName || 'N/A'}</p>
            </div>
            <div>
              <p className="font-bold">Term</p>
              <p>{dealDetails.term} months</p>
            </div>
            <div>
              <p className="font-bold">Escalation</p>
              <p>{dealDetails.escalation}%</p>
            </div>
            <div>
              <p className="font-bold">Distance to Install</p>
              <p>{dealDetails.distanceToInstall} km</p>
            </div>
            <div>
              <p className="font-bold">Additional Gross Profit</p>
              <p>{formatCurrency(dealDetails.additionalGrossProfit)}</p>
            </div>
            <div>
              <p className="font-bold">Settlement Amount</p>
              <p>{formatCurrency(dealDetails.settlement)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <button 
          className="btn btn-outline flex items-center"
          onClick={onPrev}
        >
          <span className="mr-2">←</span>
          Back: Settlement
        </button>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <GeneratePDFButton />
          <GenerateProposalButton />
          <GenerateDealPackButton />
        </div>
      </div>
    </div>
  );
};

export default TotalCostsSection;
