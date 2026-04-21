'use client';

import '@xyflow/react/dist/style.css';

import { useMemo } from 'react';
import {
  Handle,
  Controls,
  Position,
  ReactFlow,
  Background,
} from '@xyflow/react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { ChartCard } from '../../dashboard/components/chart-card';

// ----------------------------------------------------------------------

function CenterNode({ data }) {
  return (
    <Box
      sx={{
        width: 90, height: 90, borderRadius: '50%',
        bgcolor: data.bgColor, border: `3px solid ${data.borderColor}`,
        boxShadow: `0 0 20px ${data.glowColor}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'default',
      }}
    >
      {data.image ? (
        <Box component="img" src={data.image} sx={{ width: 40, height: 40, borderRadius: '50%', mb: 0.25 }} onError={(e) => { e.target.style.display = 'none'; }} />
      ) : (
        <Typography sx={{ fontSize: 24, fontWeight: 800, color: data.textColor }}>{data.initial}</Typography>
      )}
      <Typography sx={{ fontSize: 8, fontWeight: 700, color: data.textColor, textAlign: 'center', px: 0.5 }} noWrap>{data.label}</Typography>
      <Handle type="source" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </Box>
  );
}

function RelatedNode({ data }) {
  return (
    <Box
      sx={{
        width: 70, height: 70, borderRadius: '50%',
        bgcolor: data.bgColor, border: `2px solid ${data.borderColor}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.2s',
        '&:hover': { transform: 'scale(1.1)', boxShadow: `0 0 14px ${data.glowColor}` },
      }}
      onClick={data.onClick}
    >
      {data.image ? (
        <Box component="img" src={data.image} sx={{ width: 28, height: 28, borderRadius: '50%', mb: 0.25 }} onError={(e) => { e.target.style.display = 'none'; }} />
      ) : (
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: data.textColor }}>{data.initial}</Typography>
      )}
      <Typography sx={{ fontSize: 7, fontWeight: 600, color: data.textColor, textAlign: 'center', px: 0.25 }} noWrap>{data.label}</Typography>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Right} style={{ opacity: 0 }} />
    </Box>
  );
}

const nodeTypes = { center: CenterNode, related: RelatedNode };

export function NetworkCircle({ page, relatedPages }) {
  const theme = useTheme();
  const router = useRouter();

  const connections = (relatedPages || []).slice(0, 8);

  const { nodes, edges } = useMemo(() => {
    if (!page || connections.length === 0) return { nodes: [], edges: [] };

    const centerX = 200;
    const centerY = 180;
    const radius = 140;

    const n = [
      {
        id: `page-${page.id}`,
        type: 'center',
        position: { x: centerX - 45, y: centerY - 45 },
        data: {
          label: page.name,
          initial: page.name?.[0],
          image: page.profile_image_url,
          bgColor: alpha(theme.palette.primary.main, 0.12),
          borderColor: theme.palette.primary.main,
          glowColor: alpha(theme.palette.primary.main, 0.3),
          textColor: theme.palette.primary.main,
        },
        draggable: false,
      },
    ];

    const e = [];

    connections.forEach((conn, idx) => {
      const angle = (idx / connections.length) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius - 35;
      const y = centerY + Math.sin(angle) * radius - 35;

      n.push({
        id: `page-${conn.id}`,
        type: 'related',
        position: { x, y },
        data: {
          label: conn.name,
          initial: conn.name?.[0],
          image: conn.profile_image_url,
          bgColor: alpha(theme.palette.info.main, 0.08),
          borderColor: alpha(theme.palette.info.main, 0.4),
          glowColor: alpha(theme.palette.info.main, 0.2),
          textColor: theme.palette.text.primary,
          onClick: () => router.push(paths.dashboard.instagram.pages.profile(conn.id)),
        },
        draggable: true,
      });

      e.push({
        id: `edge-${page.id}-${conn.id}`,
        source: `page-${page.id}`,
        target: `page-${conn.id}`,
        type: 'default',
        animated: idx < 3,
        style: { stroke: alpha(theme.palette.primary.main, 0.2 + (1 - idx / connections.length) * 0.3), strokeWidth: 1.5 },
      });
    });

    return { nodes: n, edges: e };
  }, [page, connections, theme, router]);

  if (!page || connections.length === 0) {
    return (
      <ChartCard title="حلقه نزدیکان" icon="solar:users-group-two-rounded-bold-duotone" info="پیج‌های مرتبط در شبکه" sx={{ height: '100%' }}>
        <Box sx={{ py: 4, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">داده‌ای موجود نیست</Typography></Box>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="حلقه نزدیکان"
      icon="solar:users-group-two-rounded-bold-duotone"
      info="پیج اصلی در مرکز. خطوط متحرک = ارتباط قوی‌تر. کلیک روی هر نود → پروفایل"
      sx={{ height: '100%' }}
    >
      <Box sx={{ height: 380, direction: 'ltr', borderRadius: 1, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          minZoom={0.5}
          maxZoom={1.5}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          zoomOnScroll={false}
        >
          <Background color={alpha(theme.palette.text.primary, 0.03)} gap={20} />
          <Controls showInteractive={false} style={{ bottom: 10, left: 10 }} />
        </ReactFlow>
      </Box>
    </ChartCard>
  );
}
