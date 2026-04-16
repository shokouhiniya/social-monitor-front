'use client';

import { useRef, useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';
import { ChartCard } from '../../dashboard/components/chart-card';

// ----------------------------------------------------------------------

export function NetworkCircle({ page, relatedPages }) {
  const theme = useTheme();
  const router = useRouter();
  const [ForceGraph, setForceGraph] = useState(null);
  const graphRef = useRef();

  // Dynamic import for SSR compatibility
  useEffect(() => {
    import('react-force-graph-2d').then((mod) => {
      setForceGraph(() => mod.default);
    });
  }, []);

  const connections = (relatedPages || []).slice(0, 10);

  if (!page || connections.length === 0) {
    return (
      <ChartCard title="حلقه نزدیکان" icon="solar:users-group-two-rounded-bold-duotone" info="پیج‌هایی که بیشترین تعامل را با این پیج دارند">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">داده تعامل کافی موجود نیست</Typography>
        </Box>
      </ChartCard>
    );
  }

  // Build graph data
  const nodes = [
    { id: page.id, name: page.name, val: 20, color: theme.palette.primary.main, isCenter: true },
    ...connections.map((c, i) => ({
      id: c.id,
      name: c.name,
      val: 8 + (10 - i),
      color: theme.palette.info.main,
      isCenter: false,
    })),
  ];

  const links = connections.map((c) => ({
    source: page.id,
    target: c.id,
    value: 1,
  }));

  const graphData = { nodes, links };

  const handleNodeClick = useCallback((node) => {
    if (!node.isCenter) {
      router.push(paths.dashboard.pages.profile(node.id));
    }
  }, [router]);

  const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    const label = node.name || '';
    const fontSize = node.isCenter ? 12 / globalScale : 10 / globalScale;
    const r = node.isCenter ? 14 : 9;

    // Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color + '33';
    ctx.fill();
    ctx.strokeStyle = node.color;
    ctx.lineWidth = node.isCenter ? 3 : 1.5;
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, r * 0.6, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color + '88';
    ctx.fill();

    // Label
    ctx.font = `${node.isCenter ? 'bold ' : ''}${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = theme.palette.text.primary;
    ctx.fillText(label.slice(0, 15), node.x, node.y + r + 3);
  }, [theme]);

  return (
    <ChartCard
      title="حلقه نزدیکان"
      icon="solar:users-group-two-rounded-bold-duotone"
      info="پیج اصلی در مرکز. پیج‌های هم‌خوشه در اطراف. کلیک کنید برای مشاهده پروفایل."
    >
      <Box sx={{ height: 320, direction: 'ltr', position: 'relative' }}>
        {ForceGraph ? (
          <ForceGraph
            ref={graphRef}
            graphData={graphData}
            width={400}
            height={320}
            nodeCanvasObject={nodeCanvasObject}
            nodePointerAreaPaint={(node, color, ctx) => {
              const r = node.isCenter ? 14 : 9;
              ctx.beginPath();
              ctx.arc(node.x, node.y, r + 4, 0, 2 * Math.PI, false);
              ctx.fillStyle = color;
              ctx.fill();
            }}
            onNodeClick={handleNodeClick}
            linkColor={() => theme.palette.divider}
            linkWidth={1.5}
            cooldownTicks={50}
            backgroundColor="transparent"
            enableZoomInteraction={false}
          />
        ) : (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>

      {/* Legend */}
      <Stack spacing={0.5} sx={{ mt: 1 }}>
        {connections.slice(0, 5).map((conn) => (
          <Stack key={conn.id} direction="row" alignItems="center" spacing={1}
            sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, p: 0.5, borderRadius: 0.5 }}
            onClick={() => router.push(paths.dashboard.pages.profile(conn.id))}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontWeight: 600, flex: 1 }} noWrap>{conn.name}</Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>{conn.cluster || '—'}</Typography>
          </Stack>
        ))}
      </Stack>
    </ChartCard>
  );
}
