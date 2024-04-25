import Plugin from 'src/plugin-system/plugin.class';
import DomAccess from 'src/helper/dom-access.helper';
import Iterator from 'src/helper/iterator.helper';
import PluginManager from 'src/plugin-system/plugin.manager';
import HttpClient from 'src/service/http-client.service';


export default class CustomQuantityFieldPlugin extends Plugin {

    static options = {
        inputSelector: '.custom-quantity-field-input',
        minusButtonSelector: '.custom-quantity-field-button.is-minus',
        plusButtonSelector: '.custom-quantity-field-button.is-plus',
        quantityData: '#quantityData'
    };

    init() {
        this._client = new HttpClient();
        this._collectComponents();
        this._registerListener();
        if (this.autoSubmit === 2) {
            this._registerCartWidgetSubscriber();
        }
    }

    /**
     * collect all needed components
     */
    _collectComponents() {
        this.input = DomAccess.querySelector(this.el, this.options.inputSelector, false);
        this.minusButton = DomAccess.querySelector(this.el, this.options.minusButtonSelector, false);
        this.plusButton = DomAccess.querySelector(this.el, this.options.plusButtonSelector, false);
        this.maxPurchase = parseInt(DomAccess.querySelector(this.el, this.options.quantityData, false).getAttribute('data-maxPurchase'));
        this.minPurchase = parseInt(DomAccess.querySelector(this.el, this.options.quantityData, false).getAttribute('data-minPurchase'));
        this.purchaseSteps = parseInt(DomAccess.querySelector(this.el, this.options.quantityData, false).getAttribute('data-purchaseSteps'));
        this.autoSubmit = parseInt(DomAccess.querySelector(this.el, this.options.quantityData, false).getAttribute('data-autoSubmit'));
        this.savedInputValue = this.minPurchase;

        if (this.autoSubmit === 1 || this.autoSubmit === 2) {
            const productId = DomAccess.querySelector(this.el, this.options.quantityData, false).getAttribute('data-id');
            this.form = document.getElementById('form[' + productId + ']');
        }
    }

    /**
     * registers the event listener
     */
    _registerListener() {
        this.input.setAttribute('maxlength', this.maxPurchase.toString().length);
        this.input.addEventListener('focusin', this.clearInput.bind(this));
        this.input.addEventListener('keydown', this.checkNumbersOnly.bind(this));
        this.input.addEventListener('focusout', this.checkChangedInput.bind(this));

        /**
         * Only add event listeners for minus and plus button if they are available
         * Some shops prefers without buttons, which can cause JS errors
         */
        if (this.minusButton) {
            this.minusButton.addEventListener('click', this.onClickMinusButton.bind(this));
        }
        if (this.plusButton) {
            this.plusButton.addEventListener('click', this.onClickPlusButton.bind(this));
        }
    }

    /**
     * re-registers the plugin after cart-item load
     */
    _registerCartWidgetSubscriber() {
        const cartWidgetElements = DomAccess.querySelectorAll(document, '[data-cart-widget]', false);
        if (cartWidgetElements) {
            Iterator.iterate(cartWidgetElements, element => {

                /** @type OffCanvasCartPlugin **/
                const CartWidget = PluginManager.getPluginInstanceFromElement(element, 'CartWidget');
                if (CartWidget) {
                    CartWidget.$emitter.subscribe('fetch', this._initializePlugin.bind(this))
                }
            });
        }
    }

    /**
     * helper method to re-register the plugin
     */
    _initializePlugin() {
        window.PluginManager.initializePlugin('CustomQuantityField', '[data-custom-quantity]');
    }

    /**
     * clears input field when it is edited
     */
    clearInput(event) {
        const target = event.target;
        this.savedInputValue = event.target.value;
        target.value = '';
    }

    /**
     * checks input field if its value is a number
     */
    checkNumbersOnly(event) {
        // backspace, delete, tab, escape, enter
        const keys = [8, 46, 9, 27, 13];

        // Stop the form when enter is pressed on the number field
        if (event.key === 'Enter') {
            event.preventDefault();
        }
        // Allow: backspace, delete, tab, escape, enter and .
        for (let i = 0; i < keys.length; i++) {
            if (event.keyCode === keys[i]) {
                // let it happen, don't do anything
                return;
            }
        }
        // Allow: Ctrl+A, Command+A
        if (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true) ||
            // Allow: end, home, left, right, down, up
            (event.keyCode >= 35 && event.keyCode <= 40)) {
            // let it happen, don't do anything
            return;
        }
        // Ensure that it is a number and stop the keypress
        if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
            event.preventDefault();
        }
    }

    /**
     * rounds input value to purchase steps (if the steps > 1)
     */
    checkChangedInput(event) {
        const target = event.target; const regexPattern = new RegExp('^[0-9]*$');

        //set Input to what was before changes
        if (target.value < this.minPurchase || target.value === null || !regexPattern.test(target.value)) {
            target.value = this.savedInputValue;
        }

        //round value to purchase steps
        if (this.purchaseSteps > 1) {
            const psArray = []; let closest = null; const input = target.value;

            for (let i = this.minPurchase; i <= this.maxPurchase; i += this.purchaseSteps) {
                psArray.push(i);
            }
            Iterator.iterate(psArray, (value) => {
                if (closest == null || Math.abs(value - input) < Math.abs(closest - input)) {
                    closest = value;
                }
            });
            //set rounded input value
            target.value = closest;

            // set max purchase
            if (target.value >= this.maxPurchase) {
                target.value = psArray[psArray.length - 1];
            }
        } else {
            // set max purchase
            if (target.value > this.maxPurchase) {
                target.value = this.maxPurchase;
            }
        }

        this._onChange();
    }

    /**
     * decreases quanitiy value when minus button is clicked
     */
    onClickMinusButton() {
        const inputVal = parseInt(this.input.value);
        const newVal = inputVal - this.purchaseSteps;

        if (newVal >= this.minPurchase) {
            this.input.value = newVal.toString();
        }

        this._onChange();
    }

    /**
     * increases quanitiy value when plus button is clicked
     */
    onClickPlusButton() {
        const inputVal = parseInt(this.input.value);
        const newVal = inputVal + this.purchaseSteps;

        if (newVal <= this.maxPurchase) {
            this.input.value = newVal.toString();
        }

        this._onChange();
    }

    /**
     * on change callback for the form
     *
     * @private
     */
    _onChange() {
        if (window.csrf.enabled && window.csrf.mode === 'ajax') {
            // A new csrf token needs to be appended to the form if ajax csrf mode is used
            this._client.fetchCsrfToken((token) => {
                const csrfInput = document.createElement('input');
                csrfInput.name = '_csrf_token';
                csrfInput.value = token;
                csrfInput.type = 'hidden';
                this.form.appendChild(csrfInput);
                this.formSubmit();
            });
        } else {
            this.formSubmit();
        }
    }

    formSubmit() {
        if (this.autoSubmit === 1) {
            this.form.submit();
        }

        if (this.autoSubmit === 2) {
            this.input.dispatchEvent(new Event('change'));
        }
    }
}
