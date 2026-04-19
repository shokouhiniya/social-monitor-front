'use client';

import { useCallback } from 'react';

import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

import { signOut } from 'src/auth/context/jwt';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function SignOutButton({ variant = 'icon' }) {
  const router = useRouter();
  const { checkUserSession } = useAuthContext();

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      await checkUserSession?.();
      router.refresh();
      router.push(paths.auth.jwt.signIn);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  }, [checkUserSession, router]);

  if (variant === 'button') {
    return (
      <Button
        variant="outlined"
        color="error"
        size="small"
        startIcon={<Iconify icon="solar:logout-2-bold-duotone" />}
        onClick={handleSignOut}
      >
        خروج
      </Button>
    );
  }

  return (
    <Tooltip title="خروج از حساب" arrow>
      <IconButton onClick={handleSignOut} color="error">
        <Iconify icon="solar:logout-2-bold-duotone" width={22} />
      </IconButton>
    </Tooltip>
  );
}
