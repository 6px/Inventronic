import { stringify } from 'uuid';

const b64decode = (x) => {
  return atob(x).split('').map(function(v) {
    return v.codePointAt(0)
  });
};

export default (b64: string) => {
  return stringify(b64decode(b64+'=='));
}
