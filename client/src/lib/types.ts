// Types for the Smart Deal Cost Calculator

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

export interface Item {
  id: string;
  name: string;
  cost: number;
  quantity: number;
  locked?: boolean;
  isExtension?: boolean;
}

export interface Section {
  id: string;
  title: string;
  items: Item[];
}

export interface DealDetails {
  customerName: string;
  distanceToInstall: number;
  term: number;
  escalation: number;
  additionalGrossProfit: number;
  settlement: number;
}

export interface Scales {
  installation: Record<string, number>;
  finance_fee: Record<string, number>;
  gross_profit: Record<string, number>;
  additional_costs: {
    cost_per_kilometer: number;
    cost_per_point: number;
  };
}

export interface FactorData {
  [term: string]: {
    [escalation: string]: {
      [financeRange: string]: number;
    };
  };
}

export interface TotalCosts {
  extensionCount: number;
  hardwareTotal: number;
  hardwareInstallTotal: number;
  baseGrossProfit: number;
  additionalProfit: number;
  totalGrossProfit: number;
  financeFee: number;
  settlementAmount: number;
  financeAmount: number;
  totalPayout: number;
  hardwareRental: number;
  connectivityCost: number;
  licensingCost: number;
  totalMRC: number;
  totalExVat: number;
  totalIncVat: number;
  factorUsed: number;
}

export interface YearBreakdown {
  year: number;
  amount: number;
  monthsRemaining: number;
  isCompleted: boolean;
  startDate: Date;
  endDate: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  getUsers: () => Promise<User[]>;
  addUser: (username: string, password: string, role: 'admin' | 'user') => Promise<boolean>;
  updateUser: (id: string, updates: Partial<User & { password?: string }>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  changePassword: (userId: string, newPassword: string) => Promise<boolean>;
}

export interface CalculatorState {
  sections: Section[];
  dealDetails: DealDetails;
  scales: Scales;
  factors: FactorData;
  isInitialized: boolean;
  
  // Actions
  initializeStore: () => Promise<void>;
  updateDealDetails: (updates: Partial<DealDetails>) => void;
  updateSectionItem: (sectionId: string, itemId: string, updates: Partial<Item>) => void;
  updateScales: (updates: Partial<Scales>) => Promise<boolean>;
  updateHardware: (items: Item[]) => Promise<boolean>;
  updateConnectivity: (items: Item[]) => Promise<boolean>;
  updateLicensing: (items: Item[]) => Promise<boolean>;
  updateFactors: (factors: FactorData) => Promise<boolean>;
  calculateTotalCosts: () => TotalCosts;
}

export interface OfflineState {
  isOnline: boolean;
  pendingChanges: {
    type: 'scales' | 'hardware' | 'connectivity' | 'licensing';
    data: any;
  }[];
  
  // Actions
  setOnlineStatus: (status: boolean) => void;
  addPendingChange: (type: 'scales' | 'hardware' | 'connectivity' | 'licensing', data: any) => void;
  processPendingChanges: () => Promise<void>;
  clearPendingChanges: () => void;
}
