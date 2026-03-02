import React from 'react';
import { Box, Skeleton, Grid } from '@mui/material';

/**
 * Loading skeleton for statistics section
 */
export default function StatisticsSkeleton() {
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Grid container spacing={2}>
        {[...Array(6)].map((_, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              {/* Label skeleton */}
              <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
              {/* Value skeleton */}
              <Skeleton variant="text" width="80%" height={28} />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
