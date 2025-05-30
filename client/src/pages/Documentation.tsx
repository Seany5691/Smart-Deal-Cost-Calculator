// Documentation page component
import { Link } from 'react-router-dom';
import { MdArrowBack, MdHome } from 'react-icons/md';

const Documentation = () => {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Deal Cost Calculator Documentation</h1>
        <div className="flex space-x-4">
          <Link
            to="/dashboard"
            className="btn btn-secondary flex items-center"
          >
            <MdHome className="mr-2" />
            Dashboard
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="prose max-w-none">
          <h2>Getting Started with the Deal Cost Calculator</h2>
          <p>
            The Deal Cost Calculator is designed to help you calculate the costs associated with deals, 
            including hardware, connectivity, licensing, and other expenses. This guide will walk you through 
            the basic steps of using the calculator.
          </p>

          <h3>Step 1: Enter Deal Details</h3>
          <p>
            Start by entering the basic information about the deal:
          </p>
          <ul>
            <li><strong>Customer Name:</strong> Enter the name of the customer or organization.</li>
            <li><strong>Distance to Install:</strong> Enter the distance in kilometers to the installation site.</li>
            <li><strong>Term:</strong> Select the contract term in months (typically 36, 48, or 60).</li>
            <li><strong>Escalation:</strong> Enter the annual percentage increase for recurring costs.</li>
            <li><strong>Additional Gross Profit:</strong> Enter any additional profit amount if applicable.</li>
            <li><strong>Settlement:</strong> Enter any settlement amount if applicable.</li>
          </ul>

          <h3>Step 2: Configure Hardware</h3>
          <p>
            In the Hardware tab, you can select the hardware items needed for the deal:
          </p>
          <ul>
            <li>Browse through the available hardware items.</li>
            <li>For each item you need, enter the quantity.</li>
            <li>The system will automatically calculate the total cost based on the quantity and unit price.</li>
            <li>Some items may be marked as "extensions" which will be counted separately for extension costs.</li>
          </ul>

          <h3>Step 3: Configure Connectivity</h3>
          <p>
            In the Connectivity tab, you can select the connectivity services needed:
          </p>
          <ul>
            <li>Browse through the available connectivity options.</li>
            <li>For each service you need, enter the quantity.</li>
            <li>The system will automatically calculate the total connectivity cost.</li>
          </ul>

          <h3>Step 4: Configure Licensing</h3>
          <p>
            In the Licensing tab, you can select the software licenses needed:
          </p>
          <ul>
            <li>Browse through the available licensing options.</li>
            <li>For each license you need, enter the quantity.</li>
            <li>The system will automatically calculate the total licensing cost.</li>
          </ul>

          <h3>Step 5: Review Total Costs</h3>
          <p>
            The Total Costs section provides a comprehensive breakdown of all costs:
          </p>
          <ul>
            <li><strong>Number of Extensions:</strong> The total number of extension items selected.</li>
            <li><strong>Hardware Total:</strong> The total cost of all hardware items.</li>
            <li><strong>Extension Cost:</strong> The cost calculated based on the number of extensions.</li>
            <li><strong>Hardware & Installation Total:</strong> The combined cost of hardware, installation, and extensions.</li>
            <li><strong>Base Gross Profit:</strong> The profit calculated based on the deal size.</li>
            <li><strong>Additional Profit:</strong> Any additional profit amount you entered.</li>
            <li><strong>Total Gross Profit:</strong> The combined total of base and additional profit.</li>
            <li><strong>Finance Amount:</strong> The amount to be financed.</li>
            <li><strong>Finance Fee:</strong> The fee for financing the deal.</li>
            <li><strong>Finance Amount with Fee:</strong> The total finance amount including the fee.</li>
            <li><strong>Total MRC:</strong> The monthly recurring cost for connectivity and licensing.</li>
            <li><strong>Total Ex VAT:</strong> The total cost excluding VAT.</li>
          </ul>

          <h3>Step 6: Generate Quote</h3>
          <p>
            Once you've configured all aspects of the deal:
          </p>
          <ul>
            <li>Review all the details to ensure accuracy.</li>
            <li>Use the "Generate Quote" button to create a PDF quote for the customer.</li>
            <li>The quote will include all the selected items and calculated costs.</li>
          </ul>

          <h3>Tips for Effective Use</h3>
          <ul>
            <li><strong>Save Regularly:</strong> Your progress is automatically saved, but it's good practice to complete calculations in one session.</li>
            <li><strong>Reset for New Calculations:</strong> Use the "New Calculation" button on the dashboard to start fresh.</li>
            <li><strong>Check Extensions:</strong> Make sure hardware items are correctly marked as extensions if applicable.</li>
            <li><strong>Review Totals:</strong> Always double-check the total costs before generating a quote.</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-center">
        <Link to="/dashboard" className="btn btn-primary flex items-center">
          <MdArrowBack className="mr-2" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Documentation;
