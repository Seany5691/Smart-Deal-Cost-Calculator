import React from 'react';

const Test = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '40px auto', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Test Component</h1>
      <p style={{ marginBottom: '16px' }}>If you can see this, the React application is working correctly!</p>
      <button style={{ backgroundColor: 'blue', color: 'white', padding: '8px 16px', borderRadius: '4px', border: 'none' }}>Test Button</button>
    </div>
  );
};

export default Test;
