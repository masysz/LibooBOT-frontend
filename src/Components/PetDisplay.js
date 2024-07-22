import React from 'react';
import styled from 'styled-components';

const PetImage = styled.img`
  width: 200px;
  height: 200px;
`;

const PetDisplay = ({ pet }) => {
  return (
    <div>
      <PetImage src={`/images/${pet.type}.png`} alt={pet.name} />
      <h2>{pet.name}</h2>
    </div>
  );
};

export default PetDisplay;