import React from 'react';
import styled from 'styled-components';

const StatBar = styled.div`
  width: 100%;
  height: 20px;
  background-color: #ddd;
  margin-bottom: 10px;
`;

const StatFill = styled.div`
  width: ${props => props.value}%;
  height: 100%;
  background-color: ${props => props.color};
`;

const PetStats = ({ pet }) => {
  return (
    <div>
      <h3>Pet Stats</h3>
      <StatBar><StatFill value={pet.hunger} color="#FF9800" /></StatBar>
      <StatBar><StatFill value={pet.happiness} color="#4CAF50" /></StatBar>
      <StatBar><StatFill value={pet.energy} color="#2196F3" /></StatBar>
      <StatBar><StatFill value={pet.health} color="#F44336" /></StatBar>
      <StatBar><StatFill value={pet.cleanliness} color="#9C27B0" /></StatBar>
      <p>Experience: {pet.experience}</p>
    </div>
  );
};

export default PetStats;