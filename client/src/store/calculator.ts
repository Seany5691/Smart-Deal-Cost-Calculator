import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { configAPI } from '@/lib/api';
import { CalculatorState, DealDetails, FactorData, Item, Scales, Section, TotalCosts } from '@/lib/types';
import { getFinanceFee, getGrossProfit, getInstallationScale, calculateRentalFactor } from '@/utils';

// Default values
const DEFAULT_DEAL_DETAILS: DealDetails = {
  customerName: '',
  distanceToInstall: 0,
  term: 60,
  escalation: 0,
  additionalGrossProfit: 0,
  settlement: 0,
};

const DEFAULT_SCALES: Scales = {
  installation: {
    '0-4': 3500,
    '5-8': 3500,
    '9-16': 7000,
    '17-32': 10500,
    '33+': 15000,
  },
  finance_fee: {
    '0-20000': 1000,
    '20001-50000': 1000,
    '50001-100000': 2000,
    '100001+': 3000,
  },
  gross_profit: {
    '0-4': 15000,
    '5-8': 20000,
    '9-16': 25000,
    '17-32': 30000,
    '33+': 35000,
  },
  additional_costs: {
    cost_per_kilometer: 15,
    cost_per_point: 250,
  },
};

const DEFAULT_SECTIONS: Section[] = [
  {
    id: 'hardware',
    title: 'Hardware',
    items: [],
  },
  {
    id: 'connectivity',
    title: 'Connectivity',
    items: [],
  },
  {
    id: 'licensing',
    title: 'Licensing',
    items: [],
  },
];

const DEFAULT_FACTORS: FactorData = {
  '36_months': {
    '0%': {
      '0-20000': 0.03891,
      '20001-50000': 0.03761,
      '50001-100000': 0.03641,
      '100000+': 0.03561
    },
    '10%': {
      '0-20000': 0.04012,
      '20001-50000': 0.03882,
      '50001-100000': 0.03762,
      '100000+': 0.03682
    },
    '15%': {
      '0-20000': 0.04133,
      '20001-50000': 0.04003,
      '50001-100000': 0.03883,
      '100000+': 0.03803
    }
  },
  '48_months': {
    '0%': {
      '0-20000': 0.03133,
      '20001-50000': 0.03003,
      '50001-100000': 0.02883,
      '100000+': 0.02803
    },
    '10%': {
      '0-20000': 0.03254,
      '20001-50000': 0.03124,
      '50001-100000': 0.03004,
      '100000+': 0.02924
    },
    '15%': {
      '0-20000': 0.03375,
      '20001-50000': 0.03245,
      '50001-100000': 0.03125,
      '100000+': 0.03045
    }
  },
  '60_months': {
    '0%': {
      '0-20000': 0.02695,
      '20001-50000': 0.02565,
      '50001-100000': 0.02445,
      '100000+': 0.02365
    },
    '10%': {
      '0-20000': 0.02816,
      '20001-50000': 0.02686,
      '50001-100000': 0.02566,
      '100000+': 0.02486
    },
    '15%': {
      '0-20000': 0.02937,
      '20001-50000': 0.02807,
      '50001-100000': 0.02687,
      '100000+': 0.02607
    }
  }
};

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set, get) => ({
      sections: DEFAULT_SECTIONS,
      dealDetails: DEFAULT_DEAL_DETAILS,
      scales: DEFAULT_SCALES,
      factors: DEFAULT_FACTORS,
      isInitialized: false,

      // Initialize store with data from backend
      initializeStore: async () => {
        try {
          // Get config from backend
          const config = await configAPI.getConfig();
          
          // Initialize sections with items from config
          const sections = [...DEFAULT_SECTIONS];
          
          // Set hardware items
          if (config.hardware && Array.isArray(config.hardware)) {
            const hardwareSection = sections.find(s => s.id === 'hardware');
            if (hardwareSection) {
              hardwareSection.items = config.hardware.map((item: any) => ({
                ...item,
                quantity: 0
              }));
            }
          }
          
          // Set connectivity items
          if (config.connectivity && Array.isArray(config.connectivity)) {
            const connectivitySection = sections.find(s => s.id === 'connectivity');
            if (connectivitySection) {
              connectivitySection.items = config.connectivity.map((item: any) => ({
                ...item,
                quantity: 0
              }));
            }
          }
          
          // Set licensing items
          if (config.licensing && Array.isArray(config.licensing)) {
            const licensingSection = sections.find(s => s.id === 'licensing');
            if (licensingSection) {
              licensingSection.items = config.licensing.map((item: any) => ({
                ...item,
                quantity: 0
              }));
            }
          }
          
          // Set scales
          const scales = config.scales || DEFAULT_SCALES;
          
          // Set factors
          const factors = config.factors || DEFAULT_FACTORS;
          
          set({
            sections,
            scales,
            factors,
            isInitialized: true
          });
        } catch (error) {
          console.error('Failed to initialize calculator store:', error);
          // Use default values if initialization fails
          set({
            sections: DEFAULT_SECTIONS,
            scales: DEFAULT_SCALES,
            isInitialized: true
          });
        }
      },

      // Update deal details
      updateDealDetails: (updates) => {
        set((state) => ({
          dealDetails: { ...state.dealDetails, ...updates },
        }));
      },

      // Update a section item or add a new one if it doesn't exist
      updateSectionItem: (sectionId, itemId, updates) => {
        set((state) => {
          const sections = [...state.sections];
          const sectionIndex = sections.findIndex((s) => s.id === sectionId);
          
          if (sectionIndex === -1) return state;
          
          const section = { ...sections[sectionIndex] };
          const itemIndex = section.items.findIndex((i) => i.id === itemId);
          
          const items = [...section.items];
          
          if (itemIndex === -1) {
            // Item doesn't exist, add it as a new item
            // Make sure the update contains a complete item with all required fields
            if ('id' in updates && 'name' in updates && 'cost' in updates && 'quantity' in updates) {
              items.push(updates as Item);
            }
          } else {
            // Item exists, update it
            items[itemIndex] = { ...items[itemIndex], ...updates };
          }
          
          section.items = items;
          sections[sectionIndex] = section;
          
          return { sections };
        });
      },

      // Update scales
      updateScales: async (updates) => {
        try {
          const newScales = { ...get().scales, ...updates };
          await configAPI.updateScales(newScales);
          set({ scales: newScales });
          return true;
        } catch (error) {
          console.error('Failed to update scales:', error);
          return false;
        }
      },

      // Update hardware items
      updateHardware: async (items) => {
        try {
          await configAPI.updateHardware(items);
          set((state) => {
            const sections = [...state.sections];
            const sectionIndex = sections.findIndex((s) => s.id === 'hardware');
            
            if (sectionIndex === -1) return state;
            
            // Keep quantities from current items
            const currentItems = sections[sectionIndex].items;
            const updatedItems = items.map(item => {
              const currentItem = currentItems.find(i => i.id === item.id);
              return {
                ...item,
                quantity: currentItem ? currentItem.quantity : 0
              };
            });
            
            sections[sectionIndex].items = updatedItems;
            
            return { sections };
          });
          return true;
        } catch (error) {
          console.error('Failed to update hardware:', error);
          return false;
        }
      },

      // Update connectivity items
      updateConnectivity: async (items) => {
        try {
          await configAPI.updateConnectivity(items);
          set((state) => {
            const sections = [...state.sections];
            const sectionIndex = sections.findIndex((s) => s.id === 'connectivity');
            
            if (sectionIndex === -1) return state;
            
            // Keep quantities from current items
            const currentItems = sections[sectionIndex].items;
            const updatedItems = items.map(item => {
              const currentItem = currentItems.find(i => i.id === item.id);
              return {
                ...item,
                quantity: currentItem ? currentItem.quantity : 0
              };
            });
            
            sections[sectionIndex].items = updatedItems;
            
            return { sections };
          });
          return true;
        } catch (error) {
          console.error('Failed to update connectivity:', error);
          return false;
        }
      },

      // Update licensing items
      updateLicensing: async (items) => {
        try {
          await configAPI.updateLicensing(items);
          set((state) => {
            const sections = [...state.sections];
            const sectionIndex = sections.findIndex((s) => s.id === 'licensing');
            
            if (sectionIndex === -1) return state;
            
            // Keep quantities from current items
            const currentItems = sections[sectionIndex].items;
            const updatedItems = items.map(item => {
              const currentItem = currentItems.find(i => i.id === item.id);
              return {
                ...item,
                quantity: currentItem ? currentItem.quantity : 0
              };
            });
            
            sections[sectionIndex].items = updatedItems;
            
            return { sections };
          });
          return true;
        } catch (error) {
          console.error('Failed to update licensing:', error);
          return false;
        }
      },

      // Update factors
      updateFactors: async (factors) => {
        try {
          console.log('Calculator store: updating factors with:', JSON.stringify(factors));
          const result = await configAPI.updateFactors(factors);
          console.log('Calculator store: update result:', result);
          set({ factors });
          return true;
        } catch (error) {
          console.error('Failed to update factors:', error);
          return false;
        }
      },

      // Reset calculator to default state
      resetCalculator: () => {
        set({
          dealDetails: { ...DEFAULT_DEAL_DETAILS },
          sections: [
            {
              id: 'hardware',
              title: 'Hardware',
              items: [],
            },
            {
              id: 'connectivity',
              title: 'Connectivity',
              items: [],
            },
            {
              id: 'licensing',
              title: 'Licensing',
              items: [],
            },
          ],
          factors: [],
          totals: {
            hardwareTotal: 0,
            connectivityTotal: 0,
            licensingTotal: 0,
            hardwareInstallTotal: 0,
            baseGrossProfit: 0,
            additionalProfit: 0,
            totalGrossProfit: 0,
            financeAmount: 0,
            financeAmountWithFee: 0,
            financeFee: 0,
            totalMRC: 0,
            totalExVAT: 0,
            extensionCount: 0,
          },
        });
      },

      // Calculate total costs
      calculateTotalCosts: () => {
        const { sections, dealDetails, scales, factors } = get();
        
        // Get hardware items
        const hardwareSection = sections.find((s) => s.id === 'hardware');
        const hardwareItems = hardwareSection ? hardwareSection.items : [];
        
        // Get connectivity items
        const connectivitySection = sections.find((s) => s.id === 'connectivity');
        const connectivityItems = connectivitySection ? connectivitySection.items : [];
        
        // Get licensing items
        const licensingSection = sections.find((s) => s.id === 'licensing');
        const licensingItems = licensingSection ? licensingSection.items : [];
        
        // Calculate hardware costs
        const hardwareTotal = hardwareItems.reduce(
          (total, item) => total + item.cost * item.quantity,
          0
        );
        
        // Calculate total extensions (only items marked as extensions)
        const totalExtensions = hardwareItems.reduce(
          (total, item) => total + (item.isExtension ? item.quantity : 0),
          0
        );
        
        // Calculate installation costs
        const installationScale = getInstallationScale(totalExtensions, scales.installation);
        const distanceCost = dealDetails.distanceToInstall * scales.additional_costs.cost_per_kilometer;
        const extensionCost = totalExtensions * scales.additional_costs.cost_per_point;
        const installationCost = installationScale + distanceCost;
        
        // Calculate hardware + installation total (now including extension cost separately)
        const hardwareInstallTotal = hardwareTotal + installationCost + extensionCost;
        
        // Calculate gross profit
        const baseGrossProfit = getGrossProfit(totalExtensions, scales.gross_profit);
        const additionalProfit = dealDetails.additionalGrossProfit;
        const totalGrossProfit = baseGrossProfit + additionalProfit;
        
        // Calculate finance fee
        const baseFinanceAmount = hardwareInstallTotal + totalGrossProfit + dealDetails.settlement;
        const financeFee = getFinanceFee(baseFinanceAmount, scales.finance_fee);
        
        // Finance Amount should include the finance fee (same as total payout)
        const financeAmount = baseFinanceAmount + financeFee;
        const totalPayout = financeAmount; // Both should be the same value
        
        // Determine the factor to use based on deal details
        const termKey = `${dealDetails.term}_months`;
        const escalationKey = `${dealDetails.escalation}%`;
        let financeRangeKey = '0-20000';
        
        if (financeAmount > 100000) {
          financeRangeKey = '100000+';
        } else if (financeAmount > 50000) {
          financeRangeKey = '50001-100000';
        } else if (financeAmount > 20000) {
          financeRangeKey = '20001-50000';
        }
        
        // Get the factor from the factors object
        let factorUsed = 0.03; // Default factor
        if (factors[termKey] && 
            factors[termKey][escalationKey] && 
            factors[termKey][escalationKey][financeRangeKey]) {
          factorUsed = factors[termKey][escalationKey][financeRangeKey];
        }
        
        // Calculate monthly costs using the determined factor
        const hardwareRental = totalPayout * factorUsed;
        
        // Calculate connectivity and licensing costs
        const connectivityCost = connectivityItems.reduce(
          (total, item) => total + item.cost * item.quantity,
          0
        );
        
        const licensingCost = licensingItems.reduce(
          (total, item) => total + item.cost * item.quantity,
          0
        );
        
        // Calculate total monthly recurring cost (only connectivity and licensing)
        const totalMRC = connectivityCost + licensingCost;
        
        // Calculate total ex VAT (hardware rental + connectivity + licensing)
        const totalExVat = hardwareRental + connectivityCost + licensingCost;
        const totalIncVat = totalExVat * 1.15; // 15% VAT
        
        return {
          extensionCount: totalExtensions,
          hardwareTotal,
          hardwareInstallTotal,
          baseGrossProfit,
          additionalProfit,
          totalGrossProfit,
          financeFee,
          settlementAmount: dealDetails.settlement,
          financeAmount,
          totalPayout,
          hardwareRental,
          connectivityCost,
          licensingCost,
          totalMRC,
          totalExVat,
          totalIncVat,
          factorUsed,
        };
      },
    }),
    {
      name: 'calculator-storage',
      partialize: (state) => ({
        dealDetails: state.dealDetails,
        sections: state.sections.map(section => ({
          ...section,
          items: section.items.map(item => ({
            id: item.id,
            quantity: item.quantity
          }))
        })),
      }),
    }
  )
);
