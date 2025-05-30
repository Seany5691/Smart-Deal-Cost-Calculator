import { useState, useEffect } from 'react';
import { useCalculatorStore } from '@/store/calculator';
import { formatCurrency } from '@/utils';
import { Item } from '@/lib/types';

interface ConnectivitySectionProps {
  onNext: () => void;
  onPrev: () => void;
}

const ConnectivitySection = ({ onNext, onPrev }: ConnectivitySectionProps) => {
  const { sections, updateSectionItem, calculateTotalCosts } = useCalculatorStore();
  const [connectivityItems, setConnectivityItems] = useState<Item[]>([]);
  const [totalMonthlyCost, setTotalMonthlyCost] = useState(0);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: '' });
  const [newItem, setNewItem] = useState({ name: '', cost: 0 });
  
  // Auto-hide toast after specified duration
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load connectivity items from store
  useEffect(() => {
    const connectivitySection = sections.find(s => s.id === 'connectivity');
    if (connectivitySection) {
      setConnectivityItems(connectivitySection.items);
    }
  }, [sections]);

  // Calculate total monthly cost
  useEffect(() => {
    const total = connectivityItems.reduce(
      (sum, item) => sum + (item.cost * item.quantity),
      0
    );
    setTotalMonthlyCost(total);
  }, [connectivityItems]);

  // Handle quantity change
  const handleQuantityChange = (itemId: string, quantity: number) => {
    updateSectionItem('connectivity', itemId, { quantity });
  };

  // Handle adding a new temporary item
  const handleAddTemporaryItem = () => {
    if (!newItem.name.trim()) {
      setToast({
        show: true,
        title: 'Error',
        message: 'Please enter an item name',
        type: 'error'
      });
      return;
    }
    
    if (newItem.cost <= 0) {
      setToast({
        show: true,
        title: 'Error',
        message: 'Cost must be greater than 0',
        type: 'error'
      });
      return;
    }
    
    // Create a new temporary item with a unique ID
    const tempItem: Item = {
      id: `temp-conn-${Date.now()}`,
      name: newItem.name,
      cost: newItem.cost,
      quantity: 1,
      locked: false,
      isExtension: false
    };
    
    // Add the item to the connectivity section
    updateSectionItem('connectivity', tempItem.id, tempItem);
    
    // Reset the form
    setNewItem({ name: '', cost: 0 });
    
    setToast({
      show: true,
      title: 'Success',
      message: `Added ${tempItem.name} to connectivity items`,
      type: 'success'
    });
  };

  // Handle save and navigate to next section
  const handleSave = () => {
    const totals = calculateTotalCosts();
    
    setToast({
      show: true,
      title: 'Success',
      message: `Connectivity selections saved. Monthly connectivity cost: ${formatCurrency(totals.connectivityCost)}`,
      type: 'success'
    });
    
    onNext();
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
      
      <h2 className="text-lg font-bold mb-6">
        Connectivity Selection
      </h2>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Cost</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {connectivityItems.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.cost)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  <div className="flex justify-end">
                    <div className="relative w-24">
                      <input
                        type="number"
                        className="input text-right pr-8"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                        min={0}
                        max={100}
                      />
                      <div className="absolute inset-y-0 right-0 flex flex-col">
                        <button 
                          className="h-1/2 px-2 bg-gray-200 hover:bg-gray-300 border border-gray-300" 
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <span className="text-xs">▲</span>
                        </button>
                        <button 
                          className="h-1/2 px-2 bg-gray-200 hover:bg-gray-300 border border-gray-300" 
                          onClick={() => handleQuantityChange(item.id, Math.max(0, item.quantity - 1))}
                        >
                          <span className="text-xs">▼</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.cost * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mb-4">
        <p className="font-bold">
          Total Monthly Connectivity Cost: {formatCurrency(totalMonthlyCost)}
        </p>
      </div>

      {/* Add Temporary Item Form */}
      <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
        <h3 className="text-md font-semibold mb-3">Add Temporary Connectivity Item</h3>
        <p className="text-sm text-gray-600 mb-4">Add a custom connectivity item for this calculation only. This item will not be saved for future calculations.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input
              type="text"
              className="input w-full"
              placeholder="Enter item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Cost</label>
            <input
              type="number"
              className="input w-full"
              placeholder="Enter monthly cost"
              value={newItem.cost || ''}
              onChange={(e) => setNewItem({ ...newItem, cost: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="flex items-end">
            <button
              className="btn bg-green-500 hover:bg-green-600 text-white w-full"
              onClick={handleAddTemporaryItem}
            >
              Add Item
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button 
          className="btn btn-outline flex items-center"
          onClick={onPrev}
        >
          <span className="mr-2">←</span>
          Back: Hardware
        </button>
        <button 
          className="btn bg-blue-500 hover:bg-blue-600 text-white flex items-center"
          onClick={handleSave}
        >
          Next: Licensing
          <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
};

export default ConnectivitySection;
