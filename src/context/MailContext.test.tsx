import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { MailProvider, useMail } from './MailContext';
import * as api from '../services/mailApi';

vi.mock('../services/mailApi');

// Newer Node versions ship a global localStorage that can shadow jsdom's; use plain in-memory stores.
const memoryStorage = (): Storage => {
  const data = new Map<string, string>();
  return {
    get length() { return data.size; },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => Array.from(data.keys())[i] ?? null,
    removeItem: (k) => { data.delete(k); },
    setItem: (k, v) => { data.set(k, String(v)); },
  };
};

const mocked = vi.mocked(api);
const wrapper = ({ children }: { children: React.ReactNode }) => <MailProvider>{children}</MailProvider>;
const flush = () => act(async () => { await vi.advanceTimersByTimeAsync(0); });
const tick = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
const rateLimited = () => Object.assign(new Error('429'), { isAxiosError: true, response: { status: 429 } });

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  vi.stubGlobal('sessionStorage', memoryStorage());
  vi.useFakeTimers();
  mocked.getDomains.mockResolvedValue([{ domain: 'example.test' }]);
  mocked.getMessages.mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

describe('MailContext session handling', () => {
  it('stores only id, address and token in sessionStorage, never the password', async () => {
    mocked.createAccount.mockResolvedValue({ id: '1', address: 'a@example.test', token: 'tok' });
    const { result } = renderHook(() => useMail(), { wrapper });
    await flush();

    await act(async () => { await result.current.createNewAccount('a', 'example.test', 'secret-pw'); });

    const stored = sessionStorage.getItem('tempMailSession')!;
    expect(JSON.parse(stored)).toEqual({ id: '1', address: 'a@example.test', token: 'tok' });
    expect(stored).not.toContain('secret-pw');
    expect(localStorage.length).toBe(0);
  });

  it('purges the legacy localStorage entry that held the password', async () => {
    localStorage.setItem('tempMailAccount', JSON.stringify({ id: '1', address: 'a@b.c', password: 'pw', token: 't' }));
    renderHook(() => useMail(), { wrapper });
    await flush();
    expect(localStorage.getItem('tempMailAccount')).toBeNull();
  });

  it('logout clears the session and state', async () => {
    sessionStorage.setItem('tempMailSession', JSON.stringify({ id: '1', address: 'a@b.c', token: 't' }));
    const { result } = renderHook(() => useMail(), { wrapper });
    await flush();
    expect(result.current.account?.address).toBe('a@b.c');

    act(() => result.current.logout());

    expect(result.current.account).toBeNull();
    expect(sessionStorage.getItem('tempMailSession')).toBeNull();
  });

  it('deleteCurrentAccount calls the API and logs out', async () => {
    sessionStorage.setItem('tempMailSession', JSON.stringify({ id: '1', address: 'a@b.c', token: 't' }));
    mocked.deleteAccount.mockResolvedValue();
    const { result } = renderHook(() => useMail(), { wrapper });
    await flush();

    await act(async () => { await result.current.deleteCurrentAccount(); });

    expect(mocked.deleteAccount).toHaveBeenCalledWith('t', '1');
    expect(result.current.account).toBeNull();
  });
});

describe('MailContext polling', () => {
  beforeEach(() => {
    sessionStorage.setItem('tempMailSession', JSON.stringify({ id: '1', address: 'a@b.c', token: 't' }));
  });

  it('polls every 10s without toggling the loading flag', async () => {
    const { result } = renderHook(() => useMail(), { wrapper });
    await flush();
    expect(mocked.getMessages).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(false);

    let sawLoading = false;
    mocked.getMessages.mockImplementation(async () => {
      sawLoading = sawLoading || result.current.loading;
      return [];
    });
    await tick(10000);

    expect(mocked.getMessages).toHaveBeenCalledTimes(2);
    expect(sawLoading).toBe(false);
    expect(result.current.refreshing).toBe(false);
  });

  it('backs off after a 429 response', async () => {
    mocked.getMessages.mockRejectedValueOnce(rateLimited());
    renderHook(() => useMail(), { wrapper });
    await flush();
    expect(mocked.getMessages).toHaveBeenCalledTimes(1);

    await tick(10000);
    expect(mocked.getMessages).toHaveBeenCalledTimes(1);

    await tick(10000);
    expect(mocked.getMessages).toHaveBeenCalledTimes(2);
  });

  it('clears the error after a successful poll', async () => {
    mocked.getMessages.mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useMail(), { wrapper });
    await flush();
    expect(result.current.error).toBe('Failed to fetch messages');

    await tick(10000);
    expect(result.current.error).toBeNull();
  });
});
