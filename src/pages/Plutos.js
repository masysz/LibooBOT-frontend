import React, { useState, useEffect, useCallback } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import styled from "styled-components";
import { useUser } from '../context/userContext';
import PetDisplay from '../Components/PetDisplay';
import PetStats from '../Components/PetStats';
import PetActions from '../Components/PetActions';
import Shop from '../Components/Shop';
import { calculatePetLevel } from '../utils/petUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Plutos = () => {
  const { id, balance, setBalance } = useUser();
  const [pet, setPet] = useState({
    name: '',
    type: 'egg',
    hunger: 100,
    happiness: 100,
    energy: 100,
    health: 100,
    cleanliness: 100,
    experience: 0,
  });
  const [inventory, setInventory] = useState({});

  useEffect(() => {
    loadPetData();
  }, [id]);

  const loadPetData = useCallback(async () => {
    if (!id) return;
    const userRef = doc(db, 'telegramUsers', id);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setPet(userData.pet || pet);
      setInventory(userData.inventory || {});
    }
  }, [id]);

  const updatePetStats = useCallback(async (newStats) => {
    const updatedPet = { ...pet, ...newStats };
    setPet(updatedPet);
    const userRef = doc(db, 'telegramUsers', id);
    await updateDoc(userRef, { pet: updatedPet });
  }, [id, pet]);

  const performAction = useCallback(async (action) => {
    let newStats = { ...pet };
    let pointsEarned = 0;

    switch (action) {
      case 'feed':
        if (inventory.food > 0) {
          newStats.hunger = Math.min(newStats.hunger + 20, 100);
          newStats.energy = Math.min(newStats.energy + 5, 100);
          setInventory({ ...inventory, food: inventory.food - 1 });
          pointsEarned = 5;
        }
        break;
      case 'play':
        newStats.happiness = Math.min(newStats.happiness + 15, 100);
        newStats.energy = Math.max(newStats.energy - 10, 0);
        pointsEarned = 10;
        break;
      case 'rest':
        newStats.energy = Math.min(newStats.energy + 30, 100);
        newStats.health = Math.min(newStats.health + 5, 100);
        pointsEarned = 3;
        break;
      case 'clean':
        newStats.cleanliness = 100;
        newStats.health = Math.min(newStats.health + 10, 100);
        pointsEarned = 7;
        break;
    }

    newStats.experience += pointsEarned;
    const level = calculatePetLevel(newStats.experience);
    if (level > calculatePetLevel(pet.experience)) {
      // Pet has leveled up, maybe evolve or unlock new features
    }

    await updatePetStats(newStats);
    setBalance(balance + pointsEarned);
  }, [pet, inventory, balance, setBalance, updatePetStats]);

  const buyItem = useCallback(async (item, cost) => {
    if (balance >= cost) {
      setBalance(balance - cost);
      setInventory({ ...inventory, [item]: (inventory[item] || 0) + 1 });
      const userRef = doc(db, 'telegramUsers', id);
      await updateDoc(userRef, {
        balance: balance - cost,
        inventory: { ...inventory, [item]: (inventory[item] || 0) + 1 }
      });
    }
  }, [balance, inventory, id, setBalance]);

  return (
    <Container>
      <PetDisplay pet={pet} />
      <PetStats pet={pet} />
      <PetActions onAction={performAction} inventory={inventory} />
      <Shop buyItem={buyItem} balance={balance} />
    </Container>
  );
};

export default Plutos;