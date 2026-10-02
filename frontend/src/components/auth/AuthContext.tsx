import { createContext, useContext } from 'react';
import type { PortalUser } from '../../api/auth';

export const AuthContext = createContext<PortalUser | null>(null);
export function usePortalUser() { return useContext(AuthContext); }
