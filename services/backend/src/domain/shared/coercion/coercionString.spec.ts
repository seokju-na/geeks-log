import coercionString from './coercionString';

describe('domain.shared.coercion.coercionString', () => {
  test('should return empty string if input value is "undefined".', () => {
    expect(coercionString(undefined)).toEqual('');
  });

  test('should return empty string if input value is "null".', () => {
    expect(coercionString(null)).toEqual('');
  });

  test('should return empty string if input value is "NaN".', () => {
    expect(coercionString(NaN)).toEqual('');
  });

  test('should return empty string if input value is "Infinity" of "-Infinity".', () => {
    expect(coercionString(Infinity)).toEqual('');
    expect(coercionString(-Infinity)).toEqual('');
  });

  test('should return "0" if input value is "+0" or "-0".', () => {
    expect(coercionString(+0)).toEqual('0');
    expect(coercionString(-0)).toEqual('0');
  });
});
