import { createHash } from 'crypto';
import { sha256 } from './sha';
import { stringToHex, binaryToHex, hexToBinary, padding, paddingExplained } from './utils';

test.each(['', 'abc', 'hello world', '你好 🌍', 'a'.repeat(55), 'a'.repeat(56), 'a'.repeat(64), 'a'.repeat(1000)])('hashes %p correctly', message => {
  expect(sha256(message)).toBe(createHash('sha256').update(message).digest('hex'));
});

test('text-to-hex preserves zero-padded UTF-8 bytes', () => {
  expect(stringToHex('\u0000\nA')).toBe('000a41');
});

test('binary-to-hex preserves leading zeros and arbitrary precision', () => {
  const hex = '000123456789abcdef0123456789abcdef';
  expect(binaryToHex(hexToBinary(hex))).toBe(hex);
  expect(binaryToHex('')).toBe('');
});

test('hex padding explanation matches actual hashing input', () => {
  expect(paddingExplained('616263', 'hex').result).toBe(padding('abc'));
  expect(paddingExplained('616263', 'hex').L).toBe(24);
});
