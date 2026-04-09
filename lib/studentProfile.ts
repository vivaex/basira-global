// lib/studentProfile.ts
// Basira Central Data Layer — Re-exporting from modularized files
// Backward Compatibility maintained by preserving all original exports

export * from './types';
export * from './storage';
export * from './clinical';

// Note: If you need to add specific orchestrators that combine storage and clinical logic, 
// they can live here or in another specialized service file.
