import { fireEvent, render, screen } from '@testing-library/react';
import { createHash } from 'crypto';
import App from './App';

jest.mock('react-ga4', () => ({ initialize: jest.fn(), send: jest.fn(), event: jest.fn() }));

function finish(message) {
  fireEvent.change(screen.getByRole('textbox'), { target: { value: message } });
  fireEvent.click(screen.getByTitle('Go to last step'));
}

function expectDigest(message) {
  const digest = createHash('sha256').update(message).digest('hex');
  expect(document.body.textContent.replace(/\s/g, '')).toContain(digest);
}

test('renders the SHA-256 input and navigation', () => {
  render(<App />);
  expect(screen.getByPlaceholderText('Input...')).toBeInTheDocument();
  expect(screen.getByTitle('Go to last step')).toBeInTheDocument();
});

test.each(['', 'abc', '你好 🌍', 'a'.repeat(100)])('finishes with the correct digest for %p', message => {
  render(<App />);
  finish(message);
  expectDigest(message);
});

test('shortening a completed multi-block message does not crash', () => {
  render(<App />);
  finish('a'.repeat(100));
  finish('abc');
  expectDigest('abc');
});

test('changing input base keeps the message and digest', () => {
  render(<App />);
  finish('abc');
  fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'hex' } });
  expect(screen.getByRole('textbox')).toHaveValue('616263');
  fireEvent.click(screen.getByTitle('Go to last step'));
  expectDigest('abc');
});

test('rejects invalid pasted binary and accepts uppercase hex', () => {
  render(<App />);
  const select = screen.getAllByRole('combobox')[0];
  fireEvent.change(select, { target: { value: 'bin' } });
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'x01' } });
  expect(screen.getByRole('textbox')).toHaveValue('');
  fireEvent.change(select, { target: { value: 'hex' } });
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ABCD' } });
  expect(screen.getByRole('textbox')).toHaveValue('ABCD');
});
