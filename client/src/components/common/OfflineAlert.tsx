const OfflineAlert = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-warning-500 text-white px-4 py-3 flex items-center justify-center">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">
          You are currently offline. The app will continue to work, and changes will sync when you're back online.
        </span>
      </div>
    </div>
  );
};

export default OfflineAlert;
