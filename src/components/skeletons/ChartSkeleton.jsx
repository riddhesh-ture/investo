import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

/**
 * Loading skeleton for chart component
 */
export default function ChartSkeleton() {
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {/* Chart area skeleton */}
      <Skeleton
        variant="rectangular"
        height={400}
        sx={{ mb: 2, borderRadius: 1 }}
      />

      {/* Timeframe buttons skeleton */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {[...Array(6)].map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            width={60}
            height={32}
            sx={{ borderRadius: 1 }}
          />
        ))}
      </Stack>

      {/* Additional info skeleton */}
      <Stack spacing={1}>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} variant="text" height={20} />
        ))}
      </Stack>
    </Box>
  );
}
