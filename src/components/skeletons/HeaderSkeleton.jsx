import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

/**
 * Loading skeleton for header section
 */
export default function HeaderSkeleton() {
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Stack spacing={2}>
        {/* Title skeleton */}
        <Skeleton variant="text" width="40%" height={40} />

        {/* Price and change skeleton */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Skeleton variant="text" width="20%" height={36} />
          <Skeleton variant="text" width="15%" height={28} />
        </Stack>

        {/* Additional info skeleton */}
        <Stack direction="row" spacing={2}>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="text" width="15%" height={20} />
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
