import React from 'react';
import { useSelector } from 'react-redux';

const TestRedux = () => {
  const userId = useSelector((state) => state.user?.id);

  return (
    <div>
      <h1>User ID: {userId || 'No User ID found'}</h1>
    </div>
  );
};

export default TestRedux;
