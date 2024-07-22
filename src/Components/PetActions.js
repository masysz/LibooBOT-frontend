import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
  margin: 5px;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const PetActions = ({ onAction, inventory }) => {
  return (
    <div>
      <Button onClick={() => onAction('feed')} disabled={inventory.food <= 0}>Feed</Button>
      <Button onClick={() => onAction('play')}>Play</Button>
      <Button onClick={() => onAction('rest')}>Rest</Button>
      <Button onClick={() => onAction('clean')}>Clean</Button>
    </div>
  );
};

export default PetActions;