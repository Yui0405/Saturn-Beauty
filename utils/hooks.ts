import { useEffect, useLayoutEffect } from 'react';

/**
 * Hook isomórfico que usa useLayoutEffect en el cliente y useEffect en el servidor
 * Soluciona el warning: "useLayoutEffect does nothing on the server"
 */
export const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
