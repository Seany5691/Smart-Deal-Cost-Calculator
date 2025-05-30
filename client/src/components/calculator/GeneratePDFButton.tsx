import { useState, useEffect } from 'react';
import { useCalculatorStore } from '@/store/calculator';
import { formatCurrency } from '@/utils';
import { MdPictureAsPdf } from 'react-icons/md';
// These imports are used in the generatePDF function
// @ts-ignore - Suppressing unused import warnings as these are used in the code
import jsPDF from 'jspdf';
// @ts-ignore - Suppressing unused import warnings as these are used in the code
import autoTable from 'jspdf-autotable';

// Type for color arrays to fix TypeScript errors
type RGBColor = [number, number, number];

const GeneratePDFButton = () => {
  const { sections, dealDetails, calculateTotalCosts } = useCalculatorStore();
  const [isGenerating, setIsGenerating] = useState(false);
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

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      
      // Dynamically import the PDF generation code
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      const totals = calculateTotalCosts();
      const doc = new jsPDF();
      let yPos = 35; // Starting position for content
      const leftMargin = 25; // Consistent margins
      const rightMargin = 25;
      const pageWidth = doc.internal.pageSize.width;
      
      // Define professional color scheme
      const secondaryColor: RGBColor = [100, 116, 139]; // Subtle gray (#64748B) for headers
      const headerBgColor: RGBColor = [241, 245, 249]; // Light gray-blue (#F1F5F9) for table headers
      const accentColor: RGBColor = [17, 24, 39]; // Dark gray for text (#111827)
      const lightGray: RGBColor = [249, 250, 251]; // Very light gray (#F9FAFB) for all rows

      // Function to add header to each page
      const addHeader = async () => {
        // Add logo with maintained aspect ratio
        const logoUrl = '/logo.png'; // Served from the public folder
        const logoWidth = 20; // Smaller width for better fit
        const img = new Image();
        img.src = logoUrl;
        await new Promise((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => {
            console.warn('Logo failed to load, using placeholder text instead.');
            // Fallback: Add placeholder text if the image fails to load
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            doc.text('Smart Integrate', leftMargin, 15);
            resolve(false);
          };
        });

        try {
          const aspectRatio = img.height / img.width;
          const logoHeight = logoWidth * aspectRatio; // Maintain aspect ratio
          doc.addImage(img, 'PNG', leftMargin, 8, logoWidth, logoHeight);
        } catch (e) {
          console.error('Error adding logo to PDF:', e);
          // Fallback: Add placeholder text if the image fails to render
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
          doc.text('Smart Integrate', leftMargin, 15);
        }

        // Header: Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        const title = dealDetails.customerName ? `${dealDetails.customerName} Costing Breakdown` : "Deal Cost Calculator Breakdown";
        const fontSize = doc.getFontSize();
        const titleWidth = doc.getStringUnitWidth(title) * fontSize / doc.internal.scaleFactor;
        const titleX = (pageWidth - titleWidth) / 2; // Center title
        doc.text(title, titleX, 20);

        // Header: Date
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text('Date: May 30, 2025', pageWidth - rightMargin - 30, 15);

        // Header: Divider line
        doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setLineWidth(0.5);
        doc.line(leftMargin, 25, pageWidth - rightMargin, 25);
      };

      // Add header to the first page
      await addHeader();
      
      // Reset text color for body
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      
      // Hardware Section
      const hardwareSection = sections.find(s => s.id === 'hardware');
      if (hardwareSection) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text('Hardware Costs', leftMargin, yPos);
        yPos += 10;
        
        const hardwareData = hardwareSection.items
          .filter(item => item.quantity > 0)
          .map(item => [
            item.name,
            formatCurrency(item.cost),
            item.quantity.toString(),
            formatCurrency(item.cost * item.quantity)
          ]);

        if (hardwareData.length > 0) {
          autoTable(doc, {
            startY: yPos,
            head: [['Item', 'Cost', 'Quantity', 'Total']],
            body: hardwareData,
            headStyles: {
              fillColor: headerBgColor,
              textColor: accentColor,
              fontStyle: 'bold',
              halign: 'center',
              fontSize: 7,
              cellPadding: 3
            },
            bodyStyles: {
              fontSize: 6,
              cellPadding: 3,
              textColor: accentColor
            },
            alternateRowStyles: {
              fillColor: lightGray
            },
            columnStyles: {
              0: { cellWidth: 'auto' },
              1: { halign: 'right' },
              2: { halign: 'center' },
              3: { halign: 'right' }
            },
            margin: { left: leftMargin, right: rightMargin }
          });
          yPos = (doc as any).lastAutoTable.finalY + 15;
        } else {
          doc.setFontSize(6);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
          doc.text('No hardware items selected', leftMargin, yPos + 5);
          yPos += 15;
        }
      }

      // Connectivity Section
      const connectivitySection = sections.find(s => s.id === 'connectivity');
      if (connectivitySection) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text('Connectivity Costs', leftMargin, yPos);
        yPos += 10;
        
        const connectivityData = connectivitySection.items
          .filter(item => item.quantity > 0)
          .map(item => [
            item.name,
            formatCurrency(item.cost),
            item.quantity.toString(),
            formatCurrency(item.cost * item.quantity)
          ]);

        if (connectivityData.length > 0) {
          autoTable(doc, {
            startY: yPos,
            head: [['Item', 'Monthly Cost', 'Quantity', 'Total Monthly']],
            body: connectivityData,
            headStyles: {
              fillColor: headerBgColor,
              textColor: accentColor,
              fontStyle: 'bold',
              halign: 'center',
              fontSize: 7,
              cellPadding: 3
            },
            bodyStyles: {
              fontSize: 6,
              cellPadding: 3,
              textColor: accentColor
            },
            alternateRowStyles: {
              fillColor: lightGray
            },
            columnStyles: {
              0: { cellWidth: 'auto' },
              1: { halign: 'right' },
              2: { halign: 'center' },
              3: { halign: 'right' }
            },
            margin: { left: leftMargin, right: rightMargin }
          });
          yPos = (doc as any).lastAutoTable.finalY + 15;
        } else {
          doc.setFontSize(6);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
          doc.text('No connectivity items selected', leftMargin, yPos + 5);
          yPos += 15;
        }
      }

      // Licensing Section
      const licensingSection = sections.find(s => s.id === 'licensing');
      if (licensingSection) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text('Licensing Costs', leftMargin, yPos);
        yPos += 10;
        
        const licensingData = licensingSection.items
          .filter(item => item.quantity > 0)
          .map(item => [
            item.name,
            formatCurrency(item.cost),
            item.quantity.toString(),
            formatCurrency(item.cost * item.quantity)
          ]);

        if (licensingData.length > 0) {
          autoTable(doc, {
            startY: yPos,
            head: [['Item', 'Monthly Cost', 'Quantity', 'Total Monthly']],
            body: licensingData,
            headStyles: {
              fillColor: headerBgColor,
              textColor: accentColor,
              fontStyle: 'bold',
              halign: 'center',
              fontSize: 7,
              cellPadding: 3
            },
            bodyStyles: {
              fontSize: 6,
              cellPadding: 3,
              textColor: accentColor
            },
            alternateRowStyles: {
              fillColor: lightGray
            },
            columnStyles: {
              0: { cellWidth: 'auto' },
              1: { halign: 'right' },
              2: { halign: 'center' },
              3: { halign: 'right' }
            },
            margin: { left: leftMargin, right: rightMargin }
          });
          yPos = (doc as any).lastAutoTable.finalY + 15;
        } else {
          doc.setFontSize(6);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
          doc.text('No licensing items selected', leftMargin, yPos + 5);
          yPos += 15;
        }
      }

      // Check if we need a new page for remaining sections
      if (yPos > doc.internal.pageSize.height - 80) {
        doc.addPage();
        yPos = 20;
        await addHeader();
        yPos = 35;
      }

      // Deal Details Section
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('Deal Details', leftMargin, yPos);
      yPos += 10;
      
      const dealDetailsData = [
        ['Distance to Install', `${dealDetails.distanceToInstall} KM`],
        ['Term', `${dealDetails.term} months`],
        ['Escalation', `${dealDetails.escalation}%`],
        ['Additional Gross Profit', formatCurrency(dealDetails.additionalGrossProfit)],
        ['Settlement', formatCurrency(dealDetails.settlement)]
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Detail', 'Value']],
        body: dealDetailsData,
        headStyles: {
          fillColor: headerBgColor,
          textColor: accentColor,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 7,
          cellPadding: 3
        },
        bodyStyles: {
          fontSize: 6,
          cellPadding: 3,
          textColor: accentColor
        },
        alternateRowStyles: {
          fillColor: lightGray
        },
        columnStyles: {
          0: { cellWidth: 'auto', fontStyle: 'bold' },
          1: { halign: 'right' }
        },
        margin: { left: leftMargin, right: rightMargin }
      });
      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Always start Total Costs Summary on a new page
      doc.addPage();
      yPos = 20;
      await addHeader();
      yPos = 35;

      // Total Costs Section
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('Total Costs Summary', leftMargin, yPos);
      yPos += 10;
      
      // Organize data with proper grouping and spacing
      const totalCostsData = [
        // First group
        ['Number of Extensions', totals.extensionCount.toString()],
        ['', ''], // Empty row for spacing
        
        // Second group - Hardware costs
        ['Hardware Total', formatCurrency(totals.hardwareTotal)],
        ['Installation Cost', formatCurrency(totals.hardwareInstallTotal - totals.hardwareTotal)],
        ['Hardware & Installation Total', formatCurrency(totals.hardwareInstallTotal)],
        ['', ''], // Empty row for spacing
        
        // Third group - Term and factors
        ['Term', dealDetails.term + ' months'],
        ['Escalation', dealDetails.escalation + '%'],
        ['Factor Used', totals.factorUsed.toFixed(5)],
        ['Hardware Rental', formatCurrency(totals.hardwareRental)],
        ['', ''], // Empty row for spacing
        
        // Fourth group - Monthly costs
        ['Connectivity Cost', formatCurrency(totals.connectivityCost)],
        ['Licensing Cost', formatCurrency(totals.licensingCost)],
        ['Total MRC', formatCurrency(totals.totalMRC)],
        ['', ''], // Empty row for spacing
        
        // Fifth group - Profit and finance
        ['Extension Point Cost', formatCurrency(totals.extensionCount * useCalculatorStore.getState().scales.additional_costs.cost_per_point)],
        ['Finance Fee', formatCurrency(totals.financeFee)],
        ['Settlement Amount', formatCurrency(totals.settlementAmount)],
        ['Total Gross Profit', formatCurrency(totals.totalGrossProfit)],
        ['Finance Amount', formatCurrency(totals.financeAmount)],
        ['', ''], // Empty row for spacing
        
        // Sixth group - Totals
        ['Total MRC', formatCurrency(totals.totalMRC)],
        ['Hardware Rental', formatCurrency(totals.hardwareRental)],
        ['Total Ex VAT', formatCurrency(totals.totalExVat)],
        ['Total Inc VAT (15%)', formatCurrency(totals.totalIncVat)],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Cost Type', 'Amount']],
        body: totalCostsData,
        headStyles: {
          fillColor: headerBgColor,
          textColor: accentColor,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 7,
          cellPadding: 3
        },
        bodyStyles: {
          fontSize: 6,
          cellPadding: 3,
          textColor: accentColor,
          minCellHeight: 5 // Ensure consistent row height
        },
        alternateRowStyles: {
          fillColor: lightGray
        },
        columnStyles: {
          0: { cellWidth: 'auto', fontStyle: 'bold' },
          1: { halign: 'right' }
        },
        margin: { left: leftMargin, right: rightMargin },
        didParseCell: function(data) {
          // All rows in light gray, excluding spacing rows
          if (data.row.index !== 1 && data.row.index !== 5 && data.row.index !== 9 && 
              data.row.index !== 13 && data.row.index !== 17 && data.row.index !== 21) {
            data.cell.styles.fillColor = lightGray;
            data.cell.styles.fontStyle = 'normal';
            data.cell.styles.fontSize = 6;
          }
        },
        didDrawPage: function(data) {
          // Ensure consistent spacing after the table
          if (data.cursor) {
            yPos = data.cursor.y + 15;
          }
        }
      });

      // Add footer with page number and note
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text('All costs exclude VAT unless stated otherwise', leftMargin, doc.internal.pageSize.height - 10);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - rightMargin - 20, doc.internal.pageSize.height - 10);
      }

      // Save the PDF
      const fileName = dealDetails.customerName 
        ? `${dealDetails.customerName.trim()} Breakdown.pdf`
        : 'Deal Cost Calculator Report.pdf';
      doc.save(fileName);

      setToast({
        show: true,
        title: 'PDF Generated',
        message: 'Your PDF has been generated and downloaded',
        type: 'success'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setToast({
        show: true,
        title: 'Error',
        message: 'Failed to generate PDF',
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
        className="btn flex items-center bg-teal-500 hover:bg-teal-600 text-white"
        onClick={generatePDF}
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
            <MdPictureAsPdf className="mr-2 text-xl" />
            Generate Breakdown PDF
          </>
        )}
      </button>
    </>
  );
};

export default GeneratePDFButton;