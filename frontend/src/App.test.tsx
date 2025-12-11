import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login form', () => {
  render(<App />);
  const loginButton = screen.getByRole('button', { name: /auth\.loginButton/i });
  expect(loginButton).toBeInTheDocument();
});
