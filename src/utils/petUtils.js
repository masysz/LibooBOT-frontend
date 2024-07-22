export const calculatePetLevel = (experience) => {
    return Math.floor(Math.sqrt(experience / 100)) + 1;
  };