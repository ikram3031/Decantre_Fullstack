'use client';

import { Provider } from 'react-redux';
import { store } from './index';

// Client wrapper for Redux Store Provider
export default function ReduxProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
