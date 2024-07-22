import React from 'react';
import styled from 'styled-components';

const ShopItem = styled.div`
  margin: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const Shop = ({ buyItem, balance }) => {
  const items = [
    { name: 'food', cost: 10 },
    { name: 'toy', cost: 20 },
    { name: 'medicine', cost: 30 },
  ];

  return (
    <div>
      <h3>Shop</h3>
      {items.map(item => (
        <ShopItem key={item.name}>
          <p>{item.name} - Cost: {item.cost}</p>
          <button onClick={() => buyItem(item.name, item.cost)} disabled={balance < item.cost}>
            Buy
          </button>
        </ShopItem>
      ))}
    </div>
  );
};

export default Shop;