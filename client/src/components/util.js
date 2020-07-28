// Set array of possible notes
export const naturalNotes = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const flatNotes = naturalNotes.map((note) => note + ' flat');
const sharpNotes = naturalNotes.map((note) => note + ' sharp');
export const notes = naturalNotes.concat(flatNotes, sharpNotes).sort();

// Set object of possible colors
export const colors = {
  a: '#abc4ab',
  b: '#cdcdff',
  c: '#ffb399',
  d: '#ffe166',
  e: '#d6d6c2',
  f: '#e59a9a',
  g: '#ffb84d',
};

export const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};
