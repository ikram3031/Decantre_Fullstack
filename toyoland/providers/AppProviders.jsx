'use client';

import QueryProvider from './QueryProvider';
import ReduxProvider from '../store/ReduxProvider';

// Root client provider assembling TanStack Query and Redux Toolkit
export default function AppProviders({ children }) {
  return (
    <QueryProvider>
      <ReduxProvider>{children}</ReduxProvider>
    </QueryProvider>
  );
}
