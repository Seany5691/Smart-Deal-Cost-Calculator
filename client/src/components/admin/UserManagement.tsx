import { useState, useEffect } from 'react';
import { MdEdit, MdDelete, MdKey, MdClose } from 'react-icons/md';
import { useAuthStore } from '@/store/auth';
import { User } from '@/lib/types';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPasswordModal, setIsPasswordModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [isOpen, setIsOpen] = useState(false);
  const { getUsers, addUser, updateUser, deleteUser, changePassword } = useAuthStore();
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

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Load users from API
  const loadUsers = async () => {
    const userList = await getUsers();
    setUsers(userList);
  };

  // Handle opening the add user modal
  const handleAddUser = () => {
    setSelectedUser(null);
    setNewUsername('');
    setNewPassword('');
    setNewRole('user');
    setIsPasswordModal(false);
    onOpen();
  };

  // Handle opening the edit user modal
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setNewUsername(user.username);
    setNewRole(user.role);
    setIsPasswordModal(false);
    onOpen();
  };

  // Handle opening the change password modal
  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setIsPasswordModal(true);
    onOpen();
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const success = await deleteUser(userId);
      if (success) {
        setToast({
          show: true,
          title: 'User Deleted',
          message: 'User has been successfully deleted',
          type: 'success'
        });
        loadUsers();
      } else {
        setToast({
          show: true,
          title: 'Error',
          message: 'Failed to delete user',
          type: 'error'
        });
      }
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (isPasswordModal) {
      // Change password
      if (!selectedUser || !newPassword) return;
      
      const success = await changePassword(selectedUser.id, newPassword);
      if (success) {
        setToast({
          show: true,
          title: 'Password Changed',
          message: 'User password has been successfully changed',
          type: 'success'
        });
        onClose();
      } else {
        setToast({
          show: true,
          title: 'Error',
          message: 'Failed to change password',
          type: 'error'
        });
      }
    } else if (selectedUser) {
      // Update user
      const success = await updateUser(selectedUser.id, {
        username: newUsername,
        role: newRole,
      });
      
      if (success) {
        setToast({
          show: true,
          title: 'User Updated',
          message: 'User has been successfully updated',
          type: 'success'
        });
        loadUsers();
        onClose();
      } else {
        setToast({
          show: true,
          title: 'Error',
          message: 'Failed to update user',
          type: 'error'
        });
      }
    } else {
      // Add new user
      if (!newUsername || !newPassword) {
        setToast({
          show: true,
          title: 'Error',
          message: 'Username and password are required',
          type: 'error'
        });
        return;
      }
      
      const success = await addUser(newUsername, newPassword, newRole);
      if (success) {
        setToast({
          show: true,
          title: 'User Added',
          message: 'New user has been successfully added',
          type: 'success'
        });
        loadUsers();
        onClose();
      } else {
        setToast({
          show: true,
          title: 'Error',
          message: 'Failed to add user',
          type: 'error'
        });
      }
    }
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
        User Management
      </h2>

      <button 
        className="btn btn-primary mb-4" 
        onClick={handleAddUser}
      >
        Add User
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      className="p-1 rounded-full text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => handleEditUser(user)}
                      title="Edit user"
                    >
                      <MdEdit className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1 rounded-full text-yellow-600 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      onClick={() => handleChangePassword(user)}
                      title="Change password"
                    >
                      <MdKey className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1 rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Delete user"
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

      {/* User Modal */}
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
                  {isPasswordModal
                    ? 'Change Password'
                    : selectedUser
                    ? 'Edit User'
                    : 'Add User'}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <MdClose className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-2">
                {!isPasswordModal && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        className="input"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Enter username"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        className="input"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as 'admin' | 'user')}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </>
                )}

                {(isPasswordModal || !selectedUser) && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      className="input"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter password"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="btn btn-primary ml-3"
                onClick={handleSubmit}
              >
                {isPasswordModal
                  ? 'Change Password'
                  : selectedUser
                  ? 'Update User'
                  : 'Add User'}
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

export default UserManagement;
