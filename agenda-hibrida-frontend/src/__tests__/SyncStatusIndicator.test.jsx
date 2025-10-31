/**
 * Testes de componente: SyncStatusIndicator
 * Testa exibição de status visual e tooltips
 */

import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import SyncStatusIndicator from '../components/SyncStatusIndicator';

// Mock do hook useSyncStatus
vi.mock('../hooks/useSyncStatus', () => ({
  useSyncStatus: vi.fn()
}));

// Mock do toast
vi.mock('sonner', () => ({
  toast: {}
}));

import { useSyncStatus } from '../hooks/useSyncStatus';

describe('SyncStatusIndicator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should show loading state', () => {
    useSyncStatus.mockReturnValue({
      statuses: [],
      loading: true
    });

    render(<SyncStatusIndicator fileId={1} />);

    expect(screen.getByText('⏳')).toBeInTheDocument();
  });

  test('should show local-only icon when no sync statuses', () => {
    useSyncStatus.mockReturnValue({
      statuses: [],
      loading: false
    });

    render(<SyncStatusIndicator fileId={1} />);

    expect(screen.getByText('📁')).toBeInTheDocument();
  });

  test('should display sync status badges', () => {
    useSyncStatus.mockReturnValue({
      statuses: [
        {
          destination_name: 'Drive Pessoal',
          type: 'gdrive',
          color: 'blue',
          status: 'synced',
          last_sync: new Date().toISOString()
        },
        {
          destination_name: 'QNAP Studio',
          type: 'qnap',
          color: 'orange',
          status: 'pending'
        }
      ],
      loading: false
    });

    render(<SyncStatusIndicator fileId={1} />);

    // Deve mostrar emojis dos destinos
    expect(screen.getByText('🔵')).toBeInTheDocument(); // Google Drive azul
    expect(screen.getByText('🟠')).toBeInTheDocument(); // QNAP laranja
  });

  test('should show compact mode', () => {
    useSyncStatus.mockReturnValue({
      statuses: [
        {
          destination_name: 'Drive',
          type: 'gdrive',
          color: 'blue',
          status: 'synced'
        }
      ],
      loading: false
    });

    const { container } = render(<SyncStatusIndicator fileId={1} compact />);

    // Em modo compact, os ícones devem ser menores
    const icons = container.querySelectorAll('.text-base');
    expect(icons.length).toBeGreaterThan(0);
  });

  test('should display different status icons', () => {
    useSyncStatus.mockReturnValue({
      statuses: [
        {
          destination_name: 'Drive 1',
          type: 'gdrive',
          color: 'blue',
          status: 'synced'
        },
        {
          destination_name: 'Drive 2',
          type: 'gdrive',
          color: 'green',
          status: 'failed'
        },
        {
          destination_name: 'Drive 3',
          type: 'gdrive',
          color: 'purple',
          status: 'pending'
        }
      ],
      loading: false
    });

    render(<SyncStatusIndicator fileId={1} />);

    // Deve ter 3 badges
    expect(screen.getByText('🔵')).toBeInTheDocument();
    expect(screen.getByText('🟢')).toBeInTheDocument();
    expect(screen.getByText('🟣')).toBeInTheDocument();
  });

  test('should handle error state gracefully', () => {
    useSyncStatus.mockReturnValue({
      statuses: [],
      loading: false,
      error: 'Failed to load'
    });

    render(<SyncStatusIndicator fileId={1} />);

    // Deve mostrar estado padrão quando há erro
    expect(screen.getByText('📁')).toBeInTheDocument();
  });

  test('should render with multiple synced destinations', () => {
    useSyncStatus.mockReturnValue({
      statuses: [
        {
          destination_name: 'Drive 1',
          type: 'gdrive',
          color: 'blue',
          status: 'synced',
          remote_file_id: 'abc123'
        },
        {
          destination_name: 'Drive 2',
          type: 'gdrive',
          color: 'green',
          status: 'synced',
          remote_file_id: 'def456'
        },
        {
          destination_name: 'QNAP',
          type: 'qnap',
          color: 'orange',
          status: 'synced',
          remote_file_id: '/path/file.jpg'
        }
      ],
      loading: false
    });

    render(<SyncStatusIndicator fileId={1} />);

    // Deve mostrar todos os 3 destinos
    expect(screen.getByText('🔵')).toBeInTheDocument();
    expect(screen.getByText('🟢')).toBeInTheDocument();
    expect(screen.getByText('🟠')).toBeInTheDocument();
  });
});

