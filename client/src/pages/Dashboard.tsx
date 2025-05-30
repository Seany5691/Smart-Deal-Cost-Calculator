import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdCalculate, MdSettings, MdLogout, MdDescription } from 'react-icons/md';
import { useAuthStore } from '@/store/auth';
import { useCalculatorStore } from '@/store/calculator';

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const { dealDetails, initializeStore } = useCalculatorStore();

  // Initialize calculator store if needed
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user?.username}</h1>
        <div className="flex space-x-4">
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="btn btn-secondary flex items-center"
            >
              <MdSettings className="mr-2" />
              Admin Panel
            </Link>
          )}
          <button
            onClick={logout}
            className="btn flex items-center bg-red-500 hover:bg-red-600 text-white"
          >
            <MdLogout className="mr-2" />
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* New Calculator Card */}
        <div
          onClick={() => {
            // Reset the calculator state before navigating
            const calculatorStore = useCalculatorStore.getState();
            // @ts-ignore - resetCalculator exists but TypeScript doesn't recognize it
            calculatorStore.resetCalculator();
            window.location.href = '/calculator';
          }}
          className="p-6 rounded-lg bg-white shadow-md transition-all duration-300 hover:bg-gray-50 hover:translate-y-[-5px] hover:shadow-lg no-underline cursor-pointer"
        >
          <div className="flex flex-col space-y-4 items-start">
            <MdCalculate className="w-10 h-10 text-primary-500" />
            <h2 className="text-lg font-semibold">New Calculation</h2>
            <p className="text-gray-600">
              Start a new deal cost calculation from scratch.
            </p>
          </div>
        </div>

        {/* Continue Calculation Card - Only show if there's an existing calculation */}
        {dealDetails.customerName && (
          <Link
            to="/calculator"
            className="p-6 rounded-lg bg-white shadow-md transition-all duration-300 hover:bg-gray-50 hover:translate-y-[-5px] hover:shadow-lg no-underline"
          >
            <div className="flex flex-col space-y-4 items-start">
              <MdDescription className="w-10 h-10 text-green-500" />
              <h2 className="text-lg font-semibold">Continue Calculation</h2>
              <p className="text-gray-600">
                Continue working on {dealDetails.customerName}'s calculation.
              </p>
            </div>
          </Link>
        )}

        {/* Help & Documentation Card */}
        <Link
          to="/documentation"
          className="p-6 rounded-lg bg-white shadow-md transition-all duration-300 hover:bg-gray-50 hover:translate-y-[-5px] hover:shadow-lg no-underline"
        >
          <div className="flex flex-col space-y-4 items-start">
            <MdDescription className="w-10 h-10 text-purple-500" />
            <h2 className="text-lg font-semibold">Help & Documentation</h2>
            <p className="text-gray-600">
              Learn how to use the Deal Cost Calculator effectively.
            </p>
            <span className="text-primary-500 font-medium">
              View Documentation
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-12 p-6 rounded-lg bg-white shadow-md">
        <h2 className="text-lg font-semibold mb-4">
          About Smart Deal Cost Calculator
        </h2>
        <p className="text-gray-600">
          The Smart Deal Cost Calculator helps you calculate and manage deal costs, including hardware, 
          connectivity, licensing, and settlement calculations.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
