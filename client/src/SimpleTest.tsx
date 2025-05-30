import React from 'react';

const SimpleTest = () => {
  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '500px', 
      margin: '40px auto', 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      backgroundColor: 'white' 
    }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        Simple Test Component
      </h1>
      <p style={{ marginBottom: '16px' }}>
        This is a very simple component with inline styles to test if React is rendering correctly.
      </p>
      <button 
        style={{ 
          backgroundColor: 'blue', 
          color: 'white', 
          padding: '8px 16px', 
          borderRadius: '4px', 
          border: 'none' 
        }}
        onClick={() => alert('Button clicked!')}
      >
        Click Me
      </button>
    </div>
  );
};

export default SimpleTest;
