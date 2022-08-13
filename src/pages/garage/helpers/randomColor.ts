export default function getRandomColor() {
  return `#${Array(3).fill(null).map(() => Math.floor(Math.floor(Math.random() * 127) + 127).toString(16).padStart(2, '0')).join('')}`;
}
