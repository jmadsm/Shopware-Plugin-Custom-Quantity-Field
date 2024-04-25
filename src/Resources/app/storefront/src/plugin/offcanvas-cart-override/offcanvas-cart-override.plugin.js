import OffCanvasCartPlugin from 'src/plugin/offcanvas-cart/offcanvas-cart.plugin';

export default class CustomOffCanvasCartOverridePlugin extends OffCanvasCartPlugin {
    _registerToggleShippingSelection() {
        window.PluginManager.initializePlugin('CustomQuantityField', '[data-custom-quantity]');
        super._registerToggleShippingSelection();
    }
}
