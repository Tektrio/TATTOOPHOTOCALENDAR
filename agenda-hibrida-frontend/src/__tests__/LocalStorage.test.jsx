/**
 * Testes de componente: LocalStorage page
 * Testa renderização, interações e integrações
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import LocalStorage from '../pages/LocalStorage';

// Mock fetch global
global.fetch = vi.fn();

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('LocalStorage Page', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('should render loading state initially', () => {
    fetch.mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    render(<LocalStorage />);

    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });

  test('should render main sections after loading', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/config')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ base_path: '/test/path', enabled: true })
        });
      }
      if (url.includes('/destinations')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ destinations: [] })
        });
      }
      if (url.includes('/files')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ files: [] })
        });
      }
    });

    render(<LocalStorage />);

    await waitFor(() => {
      expect(screen.getByText(/configurar pasta local/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/destinos de sincronização/i)).toBeInTheDocument();
    expect(screen.getByText(/arquivos locais/i)).toBeInTheDocument();
  });

  test('should configure local storage path', async () => {
    fetch.mockImplementation((url, options) => {
      if (options?.method === 'POST' && url.includes('/configure')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ base_path: '/new/path', enabled: true })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ destinations: [], files: [] })
      });
    });

    render(<LocalStorage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/caminho/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/caminho/i);
    const button = screen.getByText(/configurar/i);

    fireEvent.change(input, { target: { value: '/new/path' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/configure'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('/new/path')
        })
      );
    });
  });

  test('should display destinations when loaded', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/destinations')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            destinations: [
              {
                id: 1,
                name: 'Drive Pessoal',
                type: 'gdrive',
                color: 'blue',
                enabled: true
              },
              {
                id: 2,
                name: 'QNAP Studio',
                type: 'qnap',
                color: 'orange',
                enabled: true
              }
            ]
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });

    render(<LocalStorage />);

    await waitFor(() => {
      expect(screen.getByText('Drive Pessoal')).toBeInTheDocument();
    });

    expect(screen.getByText('QNAP Studio')).toBeInTheDocument();
  });

  test('should open add Google account modal', async () => {
    fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ destinations: [], files: [] })
      })
    );

    render(<LocalStorage />);

    await waitFor(() => {
      const addButton = screen.getByText(/adicionar google drive/i);
      expect(addButton).toBeInTheDocument();
    });

    const addButton = screen.getByText(/adicionar google drive/i);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/adicionar conta google drive/i)).toBeInTheDocument();
    });
  });

  test('should scan directory', async () => {
    fetch.mockImplementation((url, options) => {
      if (options?.method === 'POST' && url.includes('/scan')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ indexed: 5 })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          base_path: '/test',
          destinations: [],
          files: []
        })
      });
    });

    render(<LocalStorage />);

    await waitFor(() => {
      const scanButton = screen.getByText(/escanear arquivos/i);
      expect(scanButton).toBeInTheDocument();
    });

    const scanButton = screen.getByText(/escanear arquivos/i);
    fireEvent.click(scanButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/scan'),
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });
});

