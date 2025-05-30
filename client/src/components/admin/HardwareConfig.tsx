import { useState, useEffect } from 'react';
import { MdEdit, MdDelete, MdAdd, MdClose } from 'react-icons/md';
import { useCalculatorStore } from '@/store/calculator';
import { Item } from '@/lib/types';
import { formatCurrency } from '@/utils';

interface HardwareConfigProps {
  onOfflineChange: (data: Item[]) => void;
}

const HardwareConfig = ({ onOfflineChange }: HardwareConfigProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemCost, setItemCost] = useState(0);
  const [itemLocked, setItemLocked] = useState(false);
  const [itemIsExtension, setItemIsExtension] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { sections, updateHardware } = useCalculatorStore();
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
  
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  // Load hardware items from store
  useEffect(() => {
    const hardwareSection = sections.find(s => s.id === 'hardware');
    if (hardwareSection) {
      setItems(hardwareSection.items);
    }
  }, [sections]);

  // Handle opening the add item modal
  const handleAddItem = () => {
    setSelectedItem(null);
    setItemName('');
    setItemCost(0);
    setItemLocked(false);
    setItemIsExtension(false);
    onOpen();
  };

  // Handle opening the edit item modal
  const handleEditItem = (item: Item) => {
    setSelectedItem(item);
    setItemName(item.name);
    setItemCost(item.cost);
    setItemLocked(item.locked || false);
    setItemIsExtension(item.isExtension || false);
    onOpen();
  };

  // Handle item deletion
  const handleDeleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const updatedItems = items.filter(item => item.id !== itemId);
      saveItems(updatedItems);
    }
  };

  // Save items to store and API
  const saveItems = async (updatedItems: Item[]) => {
    try {
      const success = await updateHardware(updatedItems);
      
      if (success) {
        setItems(updatedItems);
        onOfflineChange(updatedItems);
        setToast({
          show: true,
          title: 'Success',
          message: 'Hardware items updated successfully',
          type: 'success'
        });
      } else {
        setToast({
          show: true,
          title: 'Error',
          message: 'Failed to update hardware items',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving hardware items:', error);
      setToast({
        show: true,
        title: 'Error',
        message: 'An error occurred while saving',
        type: 'error'
      });
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!itemName || !itemCost) {
      setToast({
        show: true,
        title: 'Error',
        message: 'Item name and cost are required',
        type: 'error'
      });
      return;
    }

    let updatedItems: Item[];

    if (selectedItem) {
      // Update existing item
      updatedItems = items.map(item => 
        item.id === selectedItem.id 
          ? { ...item, name: itemName, cost: itemCost, locked: itemLocked, isExtension: itemIsExtension }
          : item
      );
    } else {
      // Add new item
      const newItem: Item = {
        id: `hw${Date.now()}`,
        name: itemName,
        cost: itemCost,
        quantity: 0,
        locked: itemLocked,
        isExtension: itemIsExtension,
      };
      updatedItems = [...items, newItem];
    }

    saveItems(updatedItems);
    onClose();
  };

  return (
    <div>
      {/* Toast notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${toast.type === 'error' ? 'bg-error-50 text-error-700' : toast.type === 'warning' ? 'bg-warning-50 text-warning-700' : toast.type === 'info' ? 'bg-blue-50 text-blue-700' : 'bg-success-50 text-success-700'}`}>
          <div className="font-bold">{toast.title}</div>
          <div>{toast.message}</div>
        </div>
      )}
      
      <h2 className="text-lg font-semibold mb-4">
        Hardware Configuration
      </h2>

      <button 
        className="btn btn-primary mb-4 flex items-center" 
        onClick={handleAddItem}
      >
        <MdAdd className="mr-2" />
        Add Hardware Item
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locked</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(item.cost)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.locked ? 'Yes' : 'No'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      className="p-1 rounded-full text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => handleEditItem(item)}
                      title="Edit item"
                    >
                      <MdEdit className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1 rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={() => handleDeleteItem(item.id)}
                      title="Delete item"
                    >
                      <MdDelete className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Item Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedItem ? 'Edit Hardware Item' : 'Add Hardware Item'}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <MdClose className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-2">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name
                    </label>
                    <input
                      className="input"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="Enter item name"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost (R)
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={itemCost}
                      onChange={(e) => setItemCost(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="flex items-center mb-4">
                    <label className="flex items-center cursor-pointer">
                      <div className="mr-3 text-sm font-medium text-gray-700">Locked Item</div>
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={itemLocked}
                          onChange={(e) => setItemLocked(e.target.checked)}
                        />
                        <div className={`block w-10 h-6 rounded-full ${itemLocked ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${itemLocked ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center mb-4">
                    <label className="flex items-center cursor-pointer">
                      <div className="mr-3 text-sm font-medium text-gray-700">Is Extension</div>
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={itemIsExtension}
                          onChange={(e) => setItemIsExtension(e.target.checked)}
                        />
                        <div className={`block w-10 h-6 rounded-full ${itemIsExtension ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${itemIsExtension ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn btn-primary ml-3"
                  onClick={handleSubmit}
                >
                  {selectedItem ? 'Update' : 'Add'}
                </button>
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
    </div>
  );
};

export default HardwareConfig;
