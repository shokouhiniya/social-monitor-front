'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useNetworkContext } from 'src/contexts/network-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Full version for expanded sidebar
export function NetworkSwitcher() {
  const router = useRouter();
  const { networks, activeNetwork, switchNetwork } = useNetworkContext();

  const handleSwitch = (networkKey) => {
    switchNetwork(networkKey);
    // Navigate to the dashboard of the selected network
    if (networkKey === 'telegram') {
      router.push(paths.dashboard.telegram.root);
    } else {
      router.push(paths.dashboard.instagram.root);
    }
  };

  return (
    <Box sx={{ px: 2, py: 1.5 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', mb: 1, display: 'block', fontSize: 10, letterSpacing: 1 }}>
        شبکه فعال
      </Typography>
      <Stack spacing={0.5}>
        {networks.map((network) => {
          const isActive = activeNetwork === network.key;
          return (
            <ButtonBase
              key={network.key}
              onClick={() => handleSwitch(network.key)}
              sx={(theme) => ({
                width: '100%',
                px: 1.5,
                py: 1,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 1.5,
                transition: 'all 0.2s',
                bgcolor: isActive ? alpha(network.color, 0.12) : 'transparent',
                border: `1.5px solid ${isActive ? alpha(network.color, 0.4) : 'transparent'}`,
                '&:hover': {
                  bgcolor: isActive ? alpha(network.color, 0.16) : alpha(theme.palette.grey[500], 0.08),
                },
              })}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: isActive ? alpha(network.color, 0.15) : alpha('#919EAB', 0.08),
                }}
              >
                <Iconify
                  icon={network.icon}
                  width={20}
                  sx={{ color: isActive ? network.color : 'text.secondary' }}
                />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? network.color : 'text.secondary',
                }}
              >
                {network.label}
              </Typography>
              {isActive && (
                <Box sx={{ ml: 'auto' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: network.color }} />
                </Box>
              )}
            </ButtonBase>
          );
        })}
      </Stack>
    </Box>
  );
}

// Mini version for collapsed sidebar — shows only active network icon
export function NetworkSwitcherMini() {
  const router = useRouter();
  const { networks, activeNetwork, switchNetwork, currentNetwork } = useNetworkContext();

  const handleSwitch = () => {
    // Cycle to next network
    const currentIdx = networks.findIndex((n) => n.key === activeNetwork);
    const nextIdx = (currentIdx + 1) % networks.length;
    const next = networks[nextIdx];
    switchNetwork(next.key);
    if (next.key === 'telegram') {
      router.push(paths.dashboard.telegram.root);
    } else {
      router.push(paths.dashboard.instagram.root);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
      <Tooltip title={`شبکه فعال: ${currentNetwork.label} (کلیک برای تغییر)`} arrow placement="right">
        <ButtonBase
          onClick={handleSwitch}
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(currentNetwork.color, 0.12),
            border: `2px solid ${alpha(currentNetwork.color, 0.4)}`,
            transition: 'all 0.2s',
            '&:hover': { bgcolor: alpha(currentNetwork.color, 0.2) },
          }}
        >
          <Iconify icon={currentNetwork.icon} width={22} sx={{ color: currentNetwork.color }} />
        </ButtonBase>
      </Tooltip>
    </Box>
  );
}
