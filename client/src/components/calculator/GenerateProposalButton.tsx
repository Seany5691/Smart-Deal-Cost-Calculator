import { useState, useEffect } from 'react';
import { useCalculatorStore } from '@/store/calculator';
import { formatCurrency } from '@/utils';

const GenerateProposalButton = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { sections, dealDetails, calculateTotalCosts } = useCalculatorStore();
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

  // Format hardware items for proposal
  const formatHardwareItems = (items: any[]) => {
    const nameMap: Record<string, string> = {
      'Yealink T31P (B&W desk- excludes PSU)': 'Yealink T31P Desk Phone',
      'Yealink T34W (Colour desk- includes PSU)': 'Yealink T34W Desk Phone',
      'Yealink T43U Switchboard (B&W- excludes PSU)': 'Yealink T43U Switchboard',
      'Yealink T44U Switchboard (Colour- excludes PSU)': 'Yealink T44U Switchboard',
      'Yealink W73P Cordless (Handset & base)': 'Yealink W73P Cordless + Base',
      'Yealink W73H (Handset only)': 'Yealink W73H Cordless',
      'Additional Mobile App': 'Additional Apps'
    };

    return items
      .filter(item => item.quantity > 0)
      .map(item => {
        const shortName = nameMap[item.name] || item.name;
        return `${item.quantity} x ${shortName}`;
      })
      .join(', ');
  };

  // Format connectivity items for proposal
  const formatConnectivityItems = (items: any[]) => {
    return items
      .filter(item => item.quantity > 0)
      .map(item => `${item.quantity} x ${item.name}`)
      .join(', ');
  };

  // Format licensing items for proposal
  const formatLicensingItems = (items: any[]) => {
    return items
      .filter(item => item.quantity > 0)
      .map(item => `${item.quantity} x ${item.name}`)
      .join(', ');
  };

  // Get solution summary for proposal
  const getSolutionSummary = (items: any[]) => {
    const hardwareList = items
      .filter(item => item.quantity > 0)
      .map(item => `${item.quantity} x ${item.name}`)
      .join(', ');
    return `We will be implementing the following: ${hardwareList} \nThis agreement will be over a ${dealDetails.term} month period.\nWith an escalation of ${dealDetails.escalation}% per annum.`;
  };

  // Download PDF
  const downloadPDF = (pdfBytes: Uint8Array, filename: string) => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // Generate proposal
  const handleGenerateProposal = async () => {
    try {
      setIsGenerating(true);
      
      // Get client name and email
      const clientName = prompt('Enter Client Full Name');
      const email = prompt('Enter Solution Specialist Email');
      
      if (!clientName || !email) {
        setToast({
          show: true,
          title: 'Error',
          message: 'Client Full Name and Solution Specialist Email are required to generate the proposal.',
          type: 'error'
        });
        setIsGenerating(false);
        return;
      }
      
      // Get items from store
      const hardwareItems = sections.find(s => s.id === 'hardware')?.items || [];
      const connectivityItems = sections.find(s => s.id === 'connectivity')?.items || [];
      const licensingItems = sections.find(s => s.id === 'licensing')?.items || [];
      const totalCosts = calculateTotalCosts();
      
      // Load PDF
      const { PDFDocument } = await import('pdf-lib');
      const existingPdfBytes = await fetch('/SI Proposal Form.pdf').then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const form = pdfDoc.getForm();

      // Fill form fields
      form.getTextField('Cover Name').setText(dealDetails.customerName || '');
      form.getTextField('Hardware 1').setText(formatHardwareItems(hardwareItems.filter(item => item.locked)));
      form.getTextField('Hardware 2').setText(formatHardwareItems(hardwareItems.filter(item => !item.locked)));
      form.getTextField('Hardware Term 1').setText(`${dealDetails.term} Months`);
      form.getTextField('Hardware Term 2').setText(`${dealDetails.term} Months`);
      form.getTextField('MRC 1').setText(formatConnectivityItems(connectivityItems));
      form.getTextField('License 1').setText(formatLicensingItems(licensingItems));
      form.getTextField('Total Hardware').setText(formatCurrency(totalCosts.hardwareRental));
      form.getTextField('Total Hardware Term').setText(`${dealDetails.term} Months`);
      form.getTextField('Total MRC').setText(formatCurrency(totalCosts.totalMRC));
      form.getTextField('Total MRC Term').setText(`${dealDetails.term} Months`);
      form.getTextField('Grand Total').setText(formatCurrency(totalCosts.totalExVat));
      form.getTextField('Client Name').setText(clientName);
      form.getTextField('Solution Summary').setText(getSolutionSummary(hardwareItems));
      form.getTextField('Email').setText(email);
      
      // New field mappings
      form.getTextField('MRC Price 1').setText(formatCurrency(totalCosts.connectivityCost));
      form.getTextField('MRC Price 3').setText(formatCurrency(totalCosts.licensingCost));
      form.getTextField('MRC Term 1').setText(`${dealDetails.term} Months`);
      form.getTextField('MRC Term 3').setText(`${dealDetails.term} Months`);
      
      // Save and download PDF
      const pdfBytes = await pdfDoc.save();
      downloadPDF(pdfBytes, `${dealDetails.customerName} Proposal.pdf`);
      
      setToast({
        show: true,
        title: 'Success',
        message: 'Proposal generated successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error generating proposal:', error);
      setToast({
        show: true,
        title: 'Error',
        message: 'Error generating proposal. Please ensure the PDF template is available and try again.',
        type: 'error'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Toast notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${toast.type === 'error' ? 'bg-error-50 text-error-700' : toast.type === 'warning' ? 'bg-warning-50 text-warning-700' : 'bg-success-50 text-success-700'}`}>
          <div className="font-bold">{toast.title}</div>
          <div>{toast.message}</div>
        </div>
      )}
      
      <button
        className="btn flex items-center bg-green-500 hover:bg-green-600 text-white"
        onClick={handleGenerateProposal}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <span className="mr-2">📄</span>
            Generate Proposal
          </>
        )}
      </button>
    </>
  );
};

export default GenerateProposalButton;
