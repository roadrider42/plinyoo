// src/App.tsx
// Zweck: Vereinfachte Root-Komponente, die nur die AppRoutes rendert.

import React from 'react';
import { AppRoutes } from '@/routes/AppRoutes';

export default function App() {
  return (
    <AppRoutes />
  );
}

