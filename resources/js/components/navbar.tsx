import {Laptop, Moon, Sun, User, Settings, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type NavbarProps = {
  authenticated: boolean;
  isAdmin: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
  };
};

type ThemeMode = 'system' | 'dark' | 'light';

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark);
  root.classList.toggle('dark', isDark);
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Navbar({ authenticated, isAdmin, user }: NavbarProps) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const toolsRef = useRef<HTMLLIElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem('theme') as ThemeMode) || 'system');

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!toolsRef.current) return;
      if (!toolsRef.current.contains(e.target as Node)) setToolsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const saved = (localStorage.getItem('theme') as ThemeMode) || 'system';
      if (saved === 'system') applyTheme('system');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const handleSignOut = async () => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/sign-out';
    
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      const csrfInput = document.createElement('input');
      csrfInput.type = 'hidden';
      csrfInput.name = '_token';
      csrfInput.value = csrfToken;
      form.appendChild(csrfInput);
    }
    
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <nav className='mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4'>
      {/* Left: Branding + Main nav */}
      <div className='flex items-center gap-6'>
        <a href='/' className='select-none'>
          <h1 className='text-lg font-semibold tracking-tight'>K1 Flow</h1>
        </a>
        <ul className='hidden md:flex items-center gap-4 text-sm'>
          <li><a className='hover:underline underline-offset-4' href='/companies'>Companies</a></li>
          {isAdmin && (
            <li><a className='hover:underline underline-offset-4' href='/admin/users'>Admin</a></li>
          )}
        </ul>
      </div>

      {/* Right: Theme toggle + User menu or Sign in/up buttons */}
      <div className='flex items-center gap-3'>
        {/* Tri-state theme toggle */}
        <div className='inline-flex items-center overflow-hidden rounded-md border border-gray-200 dark:border-[#3E3E3A]'>
          <button
            type='button'
            onClick={() => setTheme('system')}
            className={`px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-[#1f1f1e] ${theme === 'system' ? 'bg-gray-100 dark:bg-[#262625]' : ''}`}
            title='System'
            aria-pressed={theme === 'system'}
          >
            <Laptop className='w-4 h-4' />
          </button>
          <button
            type='button'
            onClick={() => setTheme('dark')}
            className={`px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-[#1f1f1e] ${theme === 'dark' ? 'bg-gray-100 dark:bg-[#262625]' : ''}`}
            title='Dark'
            aria-pressed={theme === 'dark'}
          >
            <Moon className='w-4 h-4' />
          </button>
          <button
            type='button'
            onClick={() => setTheme('light')}
            className={`px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-[#1f1f1e] ${theme === 'light' ? 'bg-gray-100 dark:bg-[#262625]' : ''}`}
            title='Light'
            aria-pressed={theme === 'light'}
          >
            <Sun className='w-4 h-4' />
          </button>
        </div>

        {authenticated && user ? (
          <div className='relative' ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className='flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors'
              title={user.name}
            >
              {getInitials(user.name)}
            </button>
            {userMenuOpen && (
              <div className='absolute right-0 mt-2 w-48 bg-white dark:bg-[#1C1C1A] rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-[#3E3E3A]'>
                <a
                  href='/user/settings'
                  className='flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#262625]'
                >
                  <Settings className='w-4 h-4' />
                  Settings
                </a>
                <button
                  onClick={handleSignOut}
                  className='flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#262625]'
                >
                  <LogOut className='w-4 h-4' />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className='flex items-center gap-2'>
            <a
              href='/sign-in'
              className='px-3 py-1.5 text-sm hover:underline underline-offset-4'
            >
              Sign In
            </a>
            <a
              href='/sign-up'
              className='px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
            >
              Sign Up
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
