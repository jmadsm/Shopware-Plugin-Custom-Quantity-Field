import CustomQuantityFieldPlugin from './plugin/custom-quantity-field/custom-quantity-field.plugin';
import CustomOffCanvasCartOverridePlugin from './plugin/offcanvas-cart-override/offcanvas-cart-override.plugin'

window.PluginManager.register('CustomQuantityField', CustomQuantityFieldPlugin, '[data-custom-quantity]');
window.PluginManager.override('OffCanvasCart', CustomOffCanvasCartOverridePlugin, '[data-offcanvas-cart]');
