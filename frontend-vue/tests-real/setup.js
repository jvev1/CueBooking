// Lo que jsdom no implementa y usan la aplicación o PrimeVue. Aquí no se sustituye
// nada del backend: los servicios y Supabase son los reales.
window.scrollTo = () => {}

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.matchMedia ??= (query) => ({
  matches: false,
  media: query,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {}
})
