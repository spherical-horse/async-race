const brands = ['Audi', 'Mercedes', 'BMW', 'VW', 'Volvo', 'Opel', 'Cadillac', 'Chevrolet'];
const models = ['A4', 'E200', '530', 'Polo', 'XC60', 'Astra', 'Escalade', 'Aveo', 'Cruze'];

export default function getRandomCarName() {
  const brand = brands[Math.floor(Math.random() * brands.length)];
  const model = models[Math.floor(Math.random() * models.length)];
  return `${brand} ${model}`;
}
