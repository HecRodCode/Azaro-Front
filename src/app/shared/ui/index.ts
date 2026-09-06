// Barrel de componentes UI reutilizables. Los features consumen desde aquí,
// nunca desde rutas profundas. Registro completo en components/catalog.md.

export { PixelButton, type PixelButtonVariant } from './pixel-button/pixel-button';
export { PixelPanel, type PixelPanelTone } from './pixel-panel/pixel-panel';
export { PixelInput } from './pixel-input/pixel-input';
export {
  PixelHeading,
  type PixelHeadingLevel,
  type PixelHeadingTone,
} from './pixel-heading/pixel-heading';
