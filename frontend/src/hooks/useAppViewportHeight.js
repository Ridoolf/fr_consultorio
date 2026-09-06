import { useEffect } from 'react';

/**
 * Sincroniza --app-height con la altura visible real (visualViewport).
 * En móvil/tablet la barra del navegador se oculta al scrollear y 100vh/svh
 * no se actualizan; esto evita que el sidebar quede corto.
 */
export function useAppViewportHeight() {
  useEffect(() => {
    const root = document.documentElement;

    const update = () => {
      const height = window.visualViewport?.height ?? window.innerHeight;
      root.style.setProperty('--app-height', `${Math.round(height)}px`);
    };

    update();

    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', update);
    viewport?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    return () => {
      viewport?.removeEventListener('resize', update);
      viewport?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);
}
