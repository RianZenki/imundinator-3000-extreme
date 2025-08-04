export const russianRoulette = () => {
   const MAX_NUMBER = 1000;
   const randomNumber = Math.floor(Math.random() * MAX_NUMBER);

   return randomNumber === 666;
};
