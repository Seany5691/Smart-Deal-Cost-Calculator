import React, { useState, useEffect } from 'react';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';
import { useCalculatorStore } from '@/store/calculator';
import { formatCurrency } from '@/utils';

// Props: onNext, onPrev functions

const SettlementSection = ({ onNext, onPrev }) => {
  const { updateDealDetails } = useCalculatorStore();
  const [startDate, setStartDate] = useState('');
  const [rentalAmount, setRentalAmount] = useState('');
  const [escalationRate, setEscalationRate] = useState('0');
  const [rentalTerm, setRentalTerm] = useState('60');
  const [rentalType, setRentalType] = useState('starting');
  const [calculations, setCalculations] = useState([]);
  const [totalSettlement, setTotalSettlement] = useState(0);
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

  // Calculate settlement amount
  const calculateSettlement = () => {
    const currentDate = new Date();
    const start = new Date(startDate);
    const rental = parseFloat(rentalAmount);
    const escalation = parseFloat(escalationRate) / 100;
    const term = parseInt(rentalTerm);

    if (!startDate || isNaN(rental)) {
      setToast({
        show: true,
        title: 'Error',
        message: 'Please enter valid start date and rental amount',
        type: 'error'
      });
      return;
    }

    let currentRental = rental;
    let newCalculations = [];
    let totalSettlementAmount = 0;

    // If using current rental, we need to de-escalate to get the starting rental
    if (rentalType === 'current') {
      // Calculate completed years
      const completedYears = Math.floor(
        (currentDate.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );
      for (let i = 0; i < completedYears; i++) {
        currentRental = currentRental / (1 + escalation);
      }
    }

    // Calculate year boundaries and remaining months
    for (let year = 1; year <= Math.ceil(term / 12); year++) {
      const yearStartDate = new Date(start);
      yearStartDate.setFullYear(start.getFullYear() + year - 1);
      const yearEndDate = new Date(start);
      yearEndDate.setFullYear(start.getFullYear() + year);

      if (currentDate >= yearEndDate) {
        // Year is completely in the past
        newCalculations.push({
          year,
          amount: 0,
          monthsRemaining: 0,
          isCompleted: true,
          startDate: yearStartDate,
          endDate: yearEndDate
        });
        currentRental *= (1 + escalation);
      } else if (currentDate < yearStartDate) {
        // Year is completely in the future
        const monthsInYear = 12;
        const yearAmount = currentRental * monthsInYear;
        totalSettlementAmount += yearAmount;

        newCalculations.push({
          year,
          amount: yearAmount,
          monthsRemaining: monthsInYear,
          isCompleted: false,
          startDate: yearStartDate,
          endDate: yearEndDate
        });
        currentRental *= (1 + escalation);
      } else {
        // Year is partially complete
        const monthsRemaining = Math.ceil(
          (yearEndDate.getTime() - currentDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000)
        );
        const yearAmount = currentRental * monthsRemaining;
        totalSettlementAmount += yearAmount;

        newCalculations.push({
          year,
          amount: yearAmount,
          monthsRemaining,
          isCompleted: false,
          startDate: yearStartDate,
          endDate: yearEndDate
        });
        currentRental *= (1 + escalation);
      }
    }

    setCalculations(newCalculations);
    setTotalSettlement(totalSettlementAmount);
    updateDealDetails({ settlement: totalSettlementAmount });

    setToast({
      show: true,
      title: 'Settlement Calculated',
      message: `Total settlement amount: ${formatCurrency(totalSettlementAmount)}`,
      type: 'success'
    });
  };

  // Ensure we have valid numbers before calculations
  const isValidNumber = (value) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && isFinite(num);
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString();
  };

  // Handle save and navigate to next section
  const handleSave = () => {
    if (totalSettlement > 0) {
      updateDealDetails({ settlement: totalSettlement });
      
      setToast({
        show: true,
        title: 'Settlement amount saved',
        message: `Settlement amount: ${formatCurrency(totalSettlement)}`,
        type: 'success'
      });
      
      onNext();
    } else {
      setToast({
        show: true,
        title: 'Warning',
        message: 'Please calculate settlement amount first',
        type: 'warning'
      });
    }
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

      <h2 className="text-xl font-semibold mb-6">
        Settlement Calculator
      </h2>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 form-group">
            <label className="label" htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              className="input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="flex-1 form-group">
            <label className="label" htmlFor="rentalType">Rental Type</label>
            <select
              id="rentalType"
              className="input"
              value={rentalType}
              onChange={(e) => setRentalType(e.target.value)}
            >
              <option value="starting">Starting Rental</option>
              <option value="current">Current Rental</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 form-group">
            <label className="label" htmlFor="rentalAmount">Rental Amount (R)</label>
            <div className="relative">
              <input
                id="rentalAmount"
                className="input pr-12"
                type="number"
                min="0"
                step="0.01"
                value={rentalAmount}
                onChange={(e) => setRentalAmount(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex">
                <div className="flex flex-col border-l border-gray-300">
                  <button 
                    type="button"
                    className="flex-1 px-2 bg-gray-100 hover:bg-gray-200 rounded-tr-md"
                    onClick={() => setRentalAmount(parseFloat(rentalAmount || 0) + 1)}
                  >
                    <span className="sr-only">Increment</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button 
                    type="button"
                    className="flex-1 px-2 bg-gray-100 hover:bg-gray-200 rounded-br-md border-t border-gray-300"
                    onClick={() => setRentalAmount(Math.max(0, parseFloat(rentalAmount || 0) - 1))}
                  >
                    <span className="sr-only">Decrement</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 form-group">
            <label className="label" htmlFor="escalationRate">Escalation Rate</label>
            <select
              id="escalationRate"
              className="input"
              value={escalationRate}
              onChange={(e) => setEscalationRate(e.target.value)}
            >
              <option value="0">0%</option>
              <option value="5">5%</option>
              <option value="10">10%</option>
              <option value="15">15%</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 form-group">
            <label className="label" htmlFor="rentalTerm">Rental Term</label>
            <select
              id="rentalTerm"
              className="input"
              value={rentalTerm}
              onChange={(e) => setRentalTerm(e.target.value)}
            >
              <option value="12">12 Months</option>
              <option value="24">24 Months</option>
              <option value="36">36 Months</option>
              <option value="48">48 Months</option>
              <option value="60">60 Months</option>
            </select>
          </div>

          <div className="flex-1 flex items-end">
            <button
              type="button"
              className={`btn w-full ${!startDate || !isValidNumber(rentalAmount) ? 'bg-gray-300 cursor-not-allowed' : 'btn-primary'}`}
              onClick={calculateSettlement}
              disabled={!startDate || !isValidNumber(rentalAmount)}
            >
              Calculate Settlement
            </button>
          </div>
        </div>
      </div>

      {calculations.length > 0 && (
        <div className="mb-6 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4">
            Settlement Breakdown
          </h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Months Remaining</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {calculations.map(({ year, amount, monthsRemaining, isCompleted, startDate, endDate }) => (
                <tr key={year} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Year {year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(startDate)} - {formatDate(endDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{isCompleted ? 'Completed' : 'Pending'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{monthsRemaining}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(amount)}</td>
                </tr>
              ))}
              <tr className="font-bold bg-gray-50">
                <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm">Total Settlement</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{formatCurrency(totalSettlement)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between">
        <button 
          type="button"
          className="btn btn-secondary flex items-center" 
          onClick={onPrev}
        >
          <MdArrowBack className="mr-2" />
          Back: Licensing
        </button>
        <button
          type="button"
          className={`btn flex items-center ${totalSettlement <= 0 ? 'bg-gray-300 cursor-not-allowed' : 'btn-primary'}`}
          onClick={handleSave}
          disabled={totalSettlement <= 0}
        >
          Next: Total Costs
          <MdArrowForward className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default SettlementSection;
