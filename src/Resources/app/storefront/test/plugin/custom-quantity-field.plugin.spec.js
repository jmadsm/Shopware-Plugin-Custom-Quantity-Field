/**
 * @jest-environment jsdom
 */

import CustomQuantityFieldPlugin from "../../src/plugin/custom-quantity-field/custom-quantity-field.plugin";

describe('custom-quantity-helper.plugin.js', () => {

    let plugin;
    let inputElement;
    let minusButton;
    let plusButton;
    let dataElement;

    beforeEach(() => {
        window.csrf = {
            enabled: false
        }

        window.router = {
            'frontend.csrf.generateToken': 	'/csrf/generate'
        }

        window.PluginManager = {
            getPluginInstancesFromElement: () => {
                return new Map();
            },
            getPlugin: () => {
                return {
                    get: () => [],
                }
            }
        }
        // Mock elements required for plugin to be constructed
        const mockedElement = document.createElement('div');

        dataElement = document.createElement('div');
        dataElement.setAttribute('id', 'quantityData');
        dataElement.setAttribute('data-minPurchase', '1')
        dataElement.setAttribute('data-purchaseSteps', '1')
        dataElement.setAttribute('data-maxPurchase', '100')
        dataElement.setAttribute('data-autoSubmit', '0')
        mockedElement.append(dataElement);

        inputElement = document.createElement('input');
        inputElement.setAttribute('class', 'custom-quantity-field-input')
        mockedElement.append(inputElement);

        plusButton = document.createElement('button');
        plusButton.setAttribute('class', 'custom-quantity-field-button is-plus')
        mockedElement.append(plusButton);

        minusButton = document.createElement('button');
        minusButton.setAttribute('class','custom-quantity-field-button is-minus');
        mockedElement.append(minusButton);

        plugin = new CustomQuantityFieldPlugin(mockedElement);
    });

    afterEach(() => {
        plugin = null;
    });

    test('Data attributes is set', () => {
        expect(plugin.maxPurchase).toBe(100);
        expect(plugin.minPurchase).toBe(1);
        expect(plugin.purchaseSteps).toBe(1);
        expect(plugin.autoSubmit).toBe(0);
    })

    test('CustomQuantityFieldPlugin exists', () => {
        expect(plugin).toBeDefined();
        expect(plugin).toBeInstanceOf(CustomQuantityFieldPlugin);
    })

    test('Buttons are available', () => {
        expect(minusButton).toBeDefined();
        expect(plusButton).toBeDefined();
    })

    test('Should clear input when input is focused', () => {
        inputElement.value = 'text';
        expect(inputElement.value).toBe('text');
        inputElement.dispatchEvent(new FocusEvent('focusin'));
        expect(inputElement.value).toBe('');
    })

    test('Input is available', () => {
        expect(inputElement).toBeDefined();
    })

    test('Click on plus button should increase value of input', () => {
        inputElement.value = 20;
        plusButton.dispatchEvent(new MouseEvent('click'));
        expect(inputElement.value).toBe("21");
    })

    test('Click on minus button should decrease value of input', () => {
        inputElement.value = 30;
        minusButton.dispatchEvent(new MouseEvent('click'));
        expect(inputElement.value).toEqual("29");
    })
})
