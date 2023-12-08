import { parse as uuidParse } from 'uuid';

const b64encode = (x) => {
  let c = ''

  for (let n = 0; n < x.length; n++) {
    c += String.fromCharCode(x[n])
  }
  return btoa(c)
};

export default (uuid: string) => {
  const bytes = uuidParse(uuid);
  return b64encode(bytes).substring(0, 22).replaceAll('+', '-').replaceAll('/', '_')
}
