import { useState, useEffect, useRef } from 'react';
import { useCalculatorStore } from '@/store/calculator';
import { formatCurrency } from '@/utils';

const GenerateDealPackButton = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { sections, dealDetails, calculateTotalCosts } = useCalculatorStore();
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: '' });
  const modalRef = useRef<HTMLDivElement>(null);

  // Form state with all required fields
  const [formData, setFormData] = useState({
    companyName: '',
    tradingAs: '',
    contactNumber: '',
    physicalAddress: '',
    physicalAddressCode: '',
    emailAddress: '',
    registrationNumber: '',
    periodInBusiness: '',
    vatNumber: '',
    postalAddress: '',
    postalAddressCode: '',
    contactPerson: '',
    telephoneNumber: '',
    faxNumber: '',
    natureOfBusiness: '',
    yearsTrading: '',
    numberOfEmployees: '',
    director1Name: '',
    director1IdNumber: '',
    director1CellNumber: '',
    director1EmailAddress: '',
    director1Address: '',
    director2Name: '',
    director2IdNumber: '',
    director2CellNumber: '',
    director2EmailAddress: '',
    director2Address: '',
    director3Name: '',
    director3IdNumber: '',
    director3CellNumber: '',
    director3EmailAddress: '',
    director3Address: '',
    director4Name: '',
    director4IdNumber: '',
    director4CellNumber: '',
    director4EmailAddress: '',
    director4Address: '',
    bank: '',
    branch: '',
    accountName: '',
    accountNumber: '',
    sortCode: '',
    auditors: '',
    auditorTelephone: '',
    insuranceBroker: '',
    brokerContactPerson: '',
    brokerTelephone: '',
    insuranceCompany: '',
    policyNumber: '',
    insuranceEmail: '',
    landlordName: '',
    landlordContactPerson: '',
    landlordTelephone: '',
    landlordPostalAddress: '',
    landlordEmail: '',
    annualTurnover: '',
    date: new Date().toISOString().split('T')[0],
    numberPorting: '',
    allowInternationalDialing: 'No',
    currentServiceProvider: '',
    currentServiceProviderAccountNumber: '',
    number1: '',
    number2: '',
    number3: '',
    number4: '',
    switchboardQty: '',
    bwDeskPhoneQty: '',
    colorDeskPhoneQty: '',
    cordlessPhoneQty: '',
    a4bwCopierQty: '',
    a4ColorCopierQty: '',
    a3bwCopierQty: '',
    a3ColorCopierQty: '',
    specialInstructions: '',
    signatory: '',
    signatoryCapacity: ''
  });

  // Auto-hide toast after specified duration
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const onOpen = () => {
    setIsOpen(true);
    setCurrentStep(1);
  };
  
  const onClose = () => setIsOpen(false);
  
  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Format hardware items for deal pack
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

  // Format connectivity items for deal pack
  const formatConnectivityItems = (items: any[]) => {
    return items
      .filter(item => item.quantity > 0)
      .map(item => `${item.quantity} x ${item.name}`)
      .join(', ');
  };

  // Format licensing items for deal pack
  const formatLicensingItems = (items: any[]) => {
    return items
      .filter(item => item.quantity > 0)
      .map(item => `${item.quantity} x ${item.name}`)
      .join(', ');
  };

  // Download PDF
  const downloadPDF = (pdfBytes: Uint8Array, filename: string) => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // Generate deal pack
  const handleGenerateDealPack = async () => {
    try {
      setIsGenerating(true);
      
      // Validate required field
      if (!formData.companyName) {
        setToast({
          show: true,
          title: 'Error',
          message: 'Company Name is required to generate the deal pack.',
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
      const existingPdfBytes = await fetch('/Deal Pack.pdf').then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const form = pdfDoc.getForm();

      // Fill company information
      form.getTextField('Company Name').setText(formData.companyName);
      form.getTextField('Trading As').setText(formData.tradingAs);
      form.getTextField('Contact Number').setText(formData.contactNumber);
      form.getTextField('Physical Address').setText(formData.physicalAddress);
      form.getTextField('Physical Address Code').setText(formData.physicalAddressCode);
      form.getTextField('Email Address').setText(formData.emailAddress);
      form.getTextField('Registration Number').setText(formData.registrationNumber);
      form.getTextField('Period In Business').setText(formData.periodInBusiness);
      form.getTextField('VAT Number').setText(formData.vatNumber);
      form.getTextField('Postal Address').setText(formData.postalAddress);
      form.getTextField('Postal Address Code').setText(formData.postalAddressCode);
      form.getTextField('Contact Person').setText(formData.contactPerson);
      form.getTextField('Telephone Number').setText(formData.telephoneNumber);
      form.getTextField('Fax Number').setText(formData.faxNumber);
      form.getTextField('Nature of business').setText(formData.natureOfBusiness);
      form.getTextField('How many years trading:').setText(formData.yearsTrading);
      form.getTextField('Number of Employees').setText(formData.numberOfEmployees);
      
      // Fill director information
      form.getTextField('Director 1 Name').setText(formData.director1Name);
      form.getTextField('Director 1 ID Number').setText(formData.director1IdNumber);
      form.getTextField('Director 1 Cell Number').setText(formData.director1CellNumber);
      form.getTextField('Director 1 Email Address').setText(formData.director1EmailAddress);
      form.getTextField('Director 1 Address').setText(formData.director1Address);
      form.getTextField('Director 2 Name').setText(formData.director2Name);
      form.getTextField('Director 2 ID Number').setText(formData.director2IdNumber);
      form.getTextField('Director 2 Cell Number').setText(formData.director2CellNumber);
      form.getTextField('Director 2 Email Address').setText(formData.director2EmailAddress);
      form.getTextField('Director 2 Address').setText(formData.director2Address);
      form.getTextField('Director 3 Name').setText(formData.director3Name);
      form.getTextField('Director 3 ID Number').setText(formData.director3IdNumber);
      form.getTextField('Director 3 Cell Number').setText(formData.director3CellNumber);
      form.getTextField('Director 3 Email Address').setText(formData.director3EmailAddress);
      form.getTextField('Director 3 Address').setText(formData.director3Address);
      form.getTextField('Director 4 Name').setText(formData.director4Name);
      form.getTextField('Director 4 ID Number').setText(formData.director4IdNumber);
      form.getTextField('Director 4 Cell Number').setText(formData.director4CellNumber);
      form.getTextField('Director 4 Email Address').setText(formData.director4EmailAddress);
      form.getTextField('Director 4 Address').setText(formData.director4Address);
      
      // Fill banking information
      form.getTextField('Bank').setText(formData.bank);
      form.getTextField('Branch').setText(formData.branch);
      form.getTextField('Account Name').setText(formData.accountName);
      form.getTextField('Account Number').setText(formData.accountNumber);
      form.getTextField('Sort Code').setText(formData.sortCode);
      
      // Fill auditor information
      form.getTextField('Auditors').setText(formData.auditors);
      form.getTextField('Auditor Telephone').setText(formData.auditorTelephone);
      
      // Fill insurance information
      form.getTextField('Insurance Broker').setText(formData.insuranceBroker);
      form.getTextField('Broker Contact Person').setText(formData.brokerContactPerson);
      form.getTextField('Broker Telephone').setText(formData.brokerTelephone);
      form.getTextField('Insurance Company').setText(formData.insuranceCompany);
      form.getTextField('Policy Number').setText(formData.policyNumber);
      form.getTextField('Insurance email').setText(formData.insuranceEmail);
      
      // Fill landlord information
      form.getTextField('Landlord Name').setText(formData.landlordName);
      form.getTextField('Landlord Contact Person').setText(formData.landlordContactPerson);
      form.getTextField('Landlord Telephone').setText(formData.landlordTelephone);
      form.getTextField('Landlord Postal Address').setText(formData.landlordPostalAddress);
      form.getTextField('Landlord email').setText(formData.landlordEmail);
      
      // Fill business information
      form.getTextField('Annual Turnover').setText(formData.annualTurnover);
      form.getTextField('Date').setText(formData.date);
      
      // Fill service information
      form.getTextField('How many numbers are you porting').setText(formData.numberPorting);
      form.getTextField('Allow international Dialing').setText(formData.allowInternationalDialing);
      form.getTextField('Current Service Provider').setText(formData.currentServiceProvider);
      form.getTextField('Current Service Provider account Number').setText(formData.currentServiceProviderAccountNumber);
      
      // Fill numbers to be ported
      form.getTextField('Number 1').setText(formData.number1);
      form.getTextField('Number 2').setText(formData.number2);
      form.getTextField('Number 3').setText(formData.number3);
      form.getTextField('Number 4').setText(formData.number4);
      
      // Fill equipment quantities
      form.getTextField('SwitchBoard').setText(formData.switchboardQty);
      form.getTextField('B&W Desk Phone').setText(formData.bwDeskPhoneQty);
      form.getTextField('Colour Desk Phone').setText(formData.colorDeskPhoneQty);
      form.getTextField('Cordless Phone').setText(formData.cordlessPhoneQty);
      
      // Fill copier quantities
      form.getTextField('A4 Black and White Copier').setText(formData.a4bwCopierQty);
      form.getTextField('A4 Colour Copier').setText(formData.a4ColorCopierQty);
      form.getTextField('A43Black and White Copier').setText(formData.a3bwCopierQty);
      form.getTextField('A3 Colour Copier').setText(formData.a3ColorCopierQty);
      
      // Fill additional information
      form.getTextField('Special instructions:').setText(formData.specialInstructions);
      form.getTextField('Signatory').setText(formData.signatory);
      form.getTextField('Signatory Capacity').setText(formData.signatoryCapacity);
      
      // Fill deal details from calculator
      form.getTextField('Term').setText(`${dealDetails.term} Months`);
      form.getTextField('Escalation').setText(`${dealDetails.escalation}%`);
      form.getTextField('DistanceToInstall').setText(`${dealDetails.distanceToInstall} km`);
      
      // Fill hardware details from calculator
      form.getTextField('HardwareItems').setText(formatHardwareItems(hardwareItems));
      form.getTextField('HardwareTotal').setText(formatCurrency(totalCosts.hardwareTotal));
      form.getTextField('HardwareRental').setText(formatCurrency(totalCosts.hardwareRental));
      
      // Fill connectivity details from calculator
      form.getTextField('ConnectivityItems').setText(formatConnectivityItems(connectivityItems));
      form.getTextField('ConnectivityTotal').setText(formatCurrency(totalCosts.connectivityCost));
      
      // Fill licensing details from calculator
      form.getTextField('LicensingItems').setText(formatLicensingItems(licensingItems));
      form.getTextField('LicensingTotal').setText(formatCurrency(totalCosts.licensingCost));
      
      // Fill total costs from calculator
      form.getTextField('TotalMRC').setText(formatCurrency(totalCosts.totalMRC));
      form.getTextField('TotalExVAT').setText(formatCurrency(totalCosts.totalExVat));
      form.getTextField('TotalIncVAT').setText(formatCurrency(totalCosts.totalIncVat));
      form.getTextField('SettlementAmount').setText(formatCurrency(totalCosts.settlementAmount));
      form.getTextField('FinanceAmount').setText(formatCurrency(totalCosts.financeAmount));
      form.getTextField('FinanceFee').setText(formatCurrency(totalCosts.financeFee));
      form.getTextField('TotalPayout').setText(formatCurrency(totalCosts.totalPayout));
      
      // Save and download PDF
      const pdfBytes = await pdfDoc.save();
      downloadPDF(pdfBytes, `${formData.companyName || 'Deal Pack'}.pdf`);
      
      setToast({
        show: true,
        title: 'Success',
        message: 'Deal Pack generated successfully',
        type: 'success'
      });
      
      onClose();
    } catch (error) {
      console.error('Error generating deal pack:', error);
      setToast({
        show: true,
        title: 'Error',
        message: 'Error generating deal pack. Please ensure the PDF template is available and try again.',
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
        className="btn flex items-center bg-purple-500 hover:bg-purple-600 text-white"
        onClick={onOpen}
      >
        <span className="mr-2">📄</span>
        Generate Deal Pack
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
            {/* Overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            
            {/* Modal content */}
            <div ref={modalRef} className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Generate Deal Pack</h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Step navigation */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Step {currentStep} of 5</span>
                    <div className="flex space-x-2">
                      <span className={`w-2 h-2 rounded-full ${currentStep === 1 ? 'bg-purple-500' : 'bg-gray-300'}`}></span>
                      <span className={`w-2 h-2 rounded-full ${currentStep === 2 ? 'bg-purple-500' : 'bg-gray-300'}`}></span>
                      <span className={`w-2 h-2 rounded-full ${currentStep === 3 ? 'bg-purple-500' : 'bg-gray-300'}`}></span>
                      <span className={`w-2 h-2 rounded-full ${currentStep === 4 ? 'bg-purple-500' : 'bg-gray-300'}`}></span>
                      <span className={`w-2 h-2 rounded-full ${currentStep === 5 ? 'bg-purple-500' : 'bg-gray-300'}`}></span>
                    </div>
                  </div>
                </div>

                {/* Step 1: Company Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="form-group">
                      <label className="label" htmlFor="companyName">Company Name <span className="text-red-500">*</span></label>
                      <input id="companyName" name="companyName" className="input" value={formData.companyName} onChange={handleInputChange} placeholder="Enter company name" required />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="tradingAs">Trading As</label>
                      <input id="tradingAs" name="tradingAs" className="input" value={formData.tradingAs} onChange={handleInputChange} placeholder="Enter trading name" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="contactNumber">Contact Number</label>
                      <input id="contactNumber" name="contactNumber" className="input" value={formData.contactNumber} onChange={handleInputChange} placeholder="Enter contact number" type="tel" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="physicalAddress">Physical Address</label>
                      <textarea id="physicalAddress" name="physicalAddress" className="input" value={formData.physicalAddress} onChange={handleInputChange} placeholder="Enter physical address" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="physicalAddressCode">Physical Address Code</label>
                      <input id="physicalAddressCode" name="physicalAddressCode" className="input" value={formData.physicalAddressCode} onChange={handleInputChange} placeholder="Enter code" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="emailAddress">Email Address</label>
                      <input id="emailAddress" name="emailAddress" className="input" value={formData.emailAddress} onChange={handleInputChange} placeholder="Enter email" type="email" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="registrationNumber">Registration Number</label>
                      <input id="registrationNumber" name="registrationNumber" className="input" value={formData.registrationNumber} onChange={handleInputChange} placeholder="Enter registration number" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="periodInBusiness">Period In Business</label>
                      <input id="periodInBusiness" name="periodInBusiness" className="input" value={formData.periodInBusiness} onChange={handleInputChange} placeholder="Enter period" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="vatNumber">VAT Number</label>
                      <input id="vatNumber" name="vatNumber" className="input" value={formData.vatNumber} onChange={handleInputChange} placeholder="Enter VAT number" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="postalAddress">Postal Address</label>
                      <textarea id="postalAddress" name="postalAddress" className="input" value={formData.postalAddress} onChange={handleInputChange} placeholder="Enter postal address" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="postalAddressCode">Postal Address Code</label>
                      <input id="postalAddressCode" name="postalAddressCode" className="input" value={formData.postalAddressCode} onChange={handleInputChange} placeholder="Enter code" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="contactPerson">Contact Person</label>
                      <input id="contactPerson" name="contactPerson" className="input" value={formData.contactPerson} onChange={handleInputChange} placeholder="Enter contact person" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="telephoneNumber">Telephone Number</label>
                      <input id="telephoneNumber" name="telephoneNumber" className="input" value={formData.telephoneNumber} onChange={handleInputChange} placeholder="Enter telephone number" type="tel" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="faxNumber">Fax Number</label>
                      <input id="faxNumber" name="faxNumber" className="input" value={formData.faxNumber} onChange={handleInputChange} placeholder="Enter fax number" type="tel" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="natureOfBusiness">Nature of Business</label>
                      <input id="natureOfBusiness" name="natureOfBusiness" className="input" value={formData.natureOfBusiness} onChange={handleInputChange} placeholder="Enter nature of business" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="yearsTrading">How Many Years Trading</label>
                      <input id="yearsTrading" name="yearsTrading" className="input" value={formData.yearsTrading} onChange={handleInputChange} placeholder="Enter years trading" type="number" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="numberOfEmployees">Number of Employees</label>
                      <input id="numberOfEmployees" name="numberOfEmployees" className="input" value={formData.numberOfEmployees} onChange={handleInputChange} placeholder="Enter number of employees" type="number" />
                    </div>
                  </div>
                )}

                {/* Step 2: Director Information */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="form-group">
                      <label className="label" htmlFor="director1Name">Director 1 Name</label>
                      <input id="director1Name" name="director1Name" className="input" value={formData.director1Name} onChange={handleInputChange} placeholder="Enter name" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="director1IdNumber">Director 1 ID Number</label>
                      <input id="director1IdNumber" name="director1IdNumber" className="input" value={formData.director1IdNumber} onChange={handleInputChange} placeholder="Enter ID number" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="director1CellNumber">Director 1 Cell Number</label>
                      <input id="director1CellNumber" name="director1CellNumber" className="input" value={formData.director1CellNumber} onChange={handleInputChange} placeholder="Enter cell number" type="tel" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="director1EmailAddress">Director 1 Email Address</label>
                      <input id="director1EmailAddress" name="director1EmailAddress" className="input" value={formData.director1EmailAddress} onChange={handleInputChange} placeholder="Enter email" type="email" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="director1Address">Director 1 Address</label>
                      <textarea id="director1Address" name="director1Address" className="input" value={formData.director1Address} onChange={handleInputChange} placeholder="Enter address" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="director2Name">Director 2 Name</label>
                      <input id="director2Name" name="director2Name" className="input" value={formData.director2Name} onChange={handleInputChange} placeholder="Enter name" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="director2IdNumber">Director 2 ID Number</label>
                      <input id="director2IdNumber" name="director2IdNumber" className="input" value={formData.director2IdNumber} onChange={handleInputChange} placeholder="Enter ID number" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="director2CellNumber">Director 2 Cell Number</label>
                      <input id="director2CellNumber" name="director2CellNumber" className="input" value={formData.director2CellNumber} onChange={handleInputChange} placeholder="Enter cell number" type="tel" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="director2EmailAddress">Director 2 Email Address</label>
                      <input id="director2EmailAddress" name="director2EmailAddress" className="input" value={formData.director2EmailAddress} onChange={handleInputChange} placeholder="Enter email" type="email" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="director2Address">Director 2 Address</label>
                      <textarea id="director2Address" name="director2Address" className="input" value={formData.director2Address} onChange={handleInputChange} placeholder="Enter address" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="director3Name">Director 3 Name</label>
                      <input id="director3Name" name="director3Name" className="input" value={formData.director3Name} onChange={handleInputChange} placeholder="Enter name" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="director3IdNumber">Director 3 ID Number</label>
                      <input id="director3IdNumber" name="director3IdNumber" className="input" value={formData.director3IdNumber} onChange={handleInputChange} placeholder="Enter ID number" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="director3CellNumber">Director 3 Cell Number</label>
                      <input id="director3CellNumber" name="director3CellNumber" className="input" value={formData.director3CellNumber} onChange={handleInputChange} placeholder="Enter cell number" type="tel" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="director3EmailAddress">Director 3 Email Address</label>
                      <input id="director3EmailAddress" name="director3EmailAddress" className="input" value={formData.director3EmailAddress} onChange={handleInputChange} placeholder="Enter email" type="email" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="director3Address">Director 3 Address</label>
                      <textarea id="director3Address" name="director3Address" className="input" value={formData.director3Address} onChange={handleInputChange} placeholder="Enter address" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="director4Name">Director 4 Name</label>
                      <input id="director4Name" name="director4Name" className="input" value={formData.director4Name} onChange={handleInputChange} placeholder="Enter name" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="director4IdNumber">Director 4 ID Number</label>
                      <input id="director4IdNumber" name="director4IdNumber" className="input" value={formData.director4IdNumber} onChange={handleInputChange} placeholder="Enter ID number" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="director4CellNumber">Director 4 Cell Number</label>
                      <input id="director4CellNumber" name="director4CellNumber" className="input" value={formData.director4CellNumber} onChange={handleInputChange} placeholder="Enter cell number" type="tel" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="director4EmailAddress">Director 4 Email Address</label>
                      <input id="director4EmailAddress" name="director4EmailAddress" className="input" value={formData.director4EmailAddress} onChange={handleInputChange} placeholder="Enter email" type="email" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="director4Address">Director 4 Address</label>
                      <textarea id="director4Address" name="director4Address" className="input" value={formData.director4Address} onChange={handleInputChange} placeholder="Enter address" />
                    </div>
                  </div>
                )}

                {/* Step 3: Banking, Auditor, and Insurance Information */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="form-group">
                      <label className="label" htmlFor="bank">Bank</label>
                      <input id="bank" name="bank" className="input" value={formData.bank} onChange={handleInputChange} placeholder="Enter bank name" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="branch">Branch</label>
                      <input id="branch" name="branch" className="input" value={formData.branch} onChange={handleInputChange} placeholder="Enter branch" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="accountName">Account Name</label>
                      <input id="accountName" name="accountName" className="input" value={formData.accountName} onChange={handleInputChange} placeholder="Enter account name" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="accountNumber">Account Number</label>
                      <input id="accountNumber" name="accountNumber" className="input" value={formData.accountNumber} onChange={handleInputChange} placeholder="Enter account number" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="sortCode">Sort Code</label>
                      <input id="sortCode" name="sortCode" className="input" value={formData.sortCode} onChange={handleInputChange} placeholder="Enter sort code" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="auditors">Auditors</label>
                      <input id="auditors" name="auditors" className="input" value={formData.auditors} onChange={handleInputChange} placeholder="Enter auditors" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="auditorTelephone">Auditor Telephone</label>
                      <input id="auditorTelephone" name="auditorTelephone" className="input" value={formData.auditorTelephone} onChange={handleInputChange} placeholder="Enter telephone" type="tel" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="insuranceBroker">Insurance Broker</label>
                      <input id="insuranceBroker" name="insuranceBroker" className="input" value={formData.insuranceBroker} onChange={handleInputChange} placeholder="Enter broker" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="brokerContactPerson">Broker Contact Person</label>
                      <input id="brokerContactPerson" name="brokerContactPerson" className="input" value={formData.brokerContactPerson} onChange={handleInputChange} placeholder="Enter contact person" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="brokerTelephone">Broker Telephone</label>
                      <input id="brokerTelephone" name="brokerTelephone" className="input" value={formData.brokerTelephone} onChange={handleInputChange} placeholder="Enter telephone" type="tel" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="insuranceCompany">Insurance Company</label>
                      <input id="insuranceCompany" name="insuranceCompany" className="input" value={formData.insuranceCompany} onChange={handleInputChange} placeholder="Enter company" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="policyNumber">Policy Number</label>
                      <input id="policyNumber" name="policyNumber" className="input" value={formData.policyNumber} onChange={handleInputChange} placeholder="Enter policy number" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="insuranceEmail">Insurance Email</label>
                      <input id="insuranceEmail" name="insuranceEmail" className="input" value={formData.insuranceEmail} onChange={handleInputChange} placeholder="Enter email" type="email" />
                    </div>
                  </div>
                )}

                {/* Step 4: Landlord and Business Information */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="form-group">
                      <label className="label" htmlFor="landlordName">Landlord Name</label>
                      <input id="landlordName" name="landlordName" className="input" value={formData.landlordName} onChange={handleInputChange} placeholder="Enter name" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="landlordContactPerson">Landlord Contact Person</label>
                      <input id="landlordContactPerson" name="landlordContactPerson" className="input" value={formData.landlordContactPerson} onChange={handleInputChange} placeholder="Enter contact person" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="landlordTelephone">Landlord Telephone</label>
                      <input id="landlordTelephone" name="landlordTelephone" className="input" value={formData.landlordTelephone} onChange={handleInputChange} placeholder="Enter telephone" type="tel" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="landlordPostalAddress">Landlord Postal Address</label>
                      <textarea id="landlordPostalAddress" name="landlordPostalAddress" className="input" value={formData.landlordPostalAddress} onChange={handleInputChange} placeholder="Enter postal address" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="landlordEmail">Landlord Email</label>
                      <input id="landlordEmail" name="landlordEmail" className="input" value={formData.landlordEmail} onChange={handleInputChange} placeholder="Enter email" type="email" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="annualTurnover">Annual Turnover</label>
                      <input id="annualTurnover" name="annualTurnover" className="input" value={formData.annualTurnover} onChange={handleInputChange} placeholder="Enter turnover" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="date">Date</label>
                      <input id="date" name="date" className="input" value={formData.date} onChange={handleInputChange} type="date" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="numberPorting">How Many Numbers Are You Porting</label>
                      <input id="numberPorting" name="numberPorting" className="input" value={formData.numberPorting} onChange={handleInputChange} placeholder="Enter number" type="number" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="allowInternationalDialing">Allow International Dialing</label>
                      <select id="allowInternationalDialing" name="allowInternationalDialing" className="input" value={formData.allowInternationalDialing} onChange={handleInputChange}>
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="currentServiceProvider">Current Service Provider</label>
                      <input id="currentServiceProvider" name="currentServiceProvider" className="input" value={formData.currentServiceProvider} onChange={handleInputChange} placeholder="Enter provider" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="currentServiceProviderAccountNumber">Current Service Provider Account Number</label>
                      <input id="currentServiceProviderAccountNumber" name="currentServiceProviderAccountNumber" className="input" value={formData.currentServiceProviderAccountNumber} onChange={handleInputChange} placeholder="Enter account number" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="number1">Number 1</label>
                      <input id="number1" name="number1" className="input" value={formData.number1} onChange={handleInputChange} placeholder="Enter number" type="tel" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="number2">Number 2</label>
                      <input id="number2" name="number2" className="input" value={formData.number2} onChange={handleInputChange} placeholder="Enter number" type="tel" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="number3">Number 3</label>
                      <input id="number3" name="number3" className="input" value={formData.number3} onChange={handleInputChange} placeholder="Enter number" type="tel" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="number4">Number 4</label>
                      <input id="number4" name="number4" className="input" value={formData.number4} onChange={handleInputChange} placeholder="Enter number" type="tel" />
                    </div>
                  </div>
                )}

                {/* Step 5: Equipment and Additional Information */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <div className="form-group">
                      <label className="label" htmlFor="switchboardQty">SwitchBoard</label>
                      <input id="switchboardQty" name="switchboardQty" className="input" value={formData.switchboardQty} onChange={handleInputChange} placeholder="Enter quantity" type="number" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="bwDeskPhoneQty">B&W Desk Phone</label>
                      <input id="bwDeskPhoneQty" name="bwDeskPhoneQty" className="input" value={formData.bwDeskPhoneQty} onChange={handleInputChange} placeholder="Enter quantity" type="number" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="colorDeskPhoneQty">Colour Desk Phone</label>
                      <input id="colorDeskPhoneQty" name="colorDeskPhoneQty" className="input" value={formData.colorDeskPhoneQty} onChange={handleInputChange} placeholder="Enter quantity" type="number" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="cordlessPhoneQty">Cordless Phone</label>
                      <input id="cordlessPhoneQty" name="cordlessPhoneQty" className="input" value={formData.cordlessPhoneQty} onChange={handleInputChange} placeholder="Enter quantity" type="number" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="a4bwCopierQty">A4 Black and White Copier</label>
                      <input id="a4bwCopierQty" name="a4bwCopierQty" className="input" value={formData.a4bwCopierQty} onChange={handleInputChange} placeholder="Enter quantity" type="number" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="a4ColorCopierQty">A4 Colour Copier</label>
                      <input id="a4ColorCopierQty" name="a4ColorCopierQty" className="input" value={formData.a4ColorCopierQty} onChange={handleInputChange} placeholder="Enter quantity" type="number" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="a3bwCopierQty">A3 Black and White Copier</label>
                      <input id="a3bwCopierQty" name="a3bwCopierQty" className="input" value={formData.a3bwCopierQty} onChange={handleInputChange} placeholder="Enter quantity" type="number" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="a3ColorCopierQty">A3 Colour Copier</label>
                      <input id="a3ColorCopierQty" name="a3ColorCopierQty" className="input" value={formData.a3ColorCopierQty} onChange={handleInputChange} placeholder="Enter quantity" type="number" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="specialInstructions">Special Instructions</label>
                      <textarea id="specialInstructions" name="specialInstructions" className="input" value={formData.specialInstructions} onChange={handleInputChange} placeholder="Enter special instructions" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="signatory">Signatory</label>
                      <input id="signatory" name="signatory" className="input" value={formData.signatory} onChange={handleInputChange} placeholder="Enter signatory" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="signatoryCapacity">Signatory Capacity</label>
                      <input id="signatoryCapacity" name="signatoryCapacity" className="input" value={formData.signatoryCapacity} onChange={handleInputChange} placeholder="Enter capacity" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {currentStep === 5 ? (
                  <button
                    type="button"
                    className={`btn ${isGenerating ? 'bg-purple-300' : 'bg-purple-500 hover:bg-purple-600'} text-white ml-3`}
                    onClick={handleGenerateDealPack}
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
                    ) : 'Generate'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn bg-purple-500 hover:bg-purple-600 text-white ml-3"
                    onClick={nextStep}
                  >
                    Next
                  </button>
                )}
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 mr-3"
                    onClick={prevStep}
                  >
                    Previous
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GenerateDealPackButton;