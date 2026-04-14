'use client';

import { useEffect } from 'react';
import { syncAllData } from '@/lib/storage';

/**
 * CloudSyncInitializer
 * Runs the background synchronization logic on application load.
 * This ensures that any data saved in localStorage is safely backed up to Supabase.
 */
export default function CloudSyncInitializer() {
  useEffect(() => {
    // We run the sync after a short delay to prioritize initial page load performance
    const timer = setTimeout(() => {
      syncAllData()
        .then((res) => {
          if (res.success) {
            console.log('☁️ Basira Cloud Sync: Successfully completed.');
          } else if (res.error !== 'No active session') {
            console.warn('☁️ Basira Cloud Sync:', res.error);
          }
        })
        .catch((err) => {
          console.error('☁️ Basira Cloud Sync Critical Error:', err);
        });
    }, 3000); // 3-second delay

    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
}
