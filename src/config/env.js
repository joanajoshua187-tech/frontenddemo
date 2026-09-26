export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? '/api',
  demoMode: import.meta.env.VITE_DEMO_MODE !== 'false',
  routerMode: import.meta.env.VITE_ROUTER_MODE === 'hash' ? 'hash' : 'browser',
  isProduction: import.meta.env.PROD,
}
