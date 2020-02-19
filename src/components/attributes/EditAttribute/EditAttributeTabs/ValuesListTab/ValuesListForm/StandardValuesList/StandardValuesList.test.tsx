import {wait} from '@apollo/react-testing';
import {mount, shallow} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import StandardValuesList from './StandardValuesList';

describe('StandardValuesList', () => {
    const onValuesUpdate = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Render existing list', async () => {
        const comp = shallow(<StandardValuesList values={['value 1', 'value 2']} onValuesUpdate={onValuesUpdate} />);

        expect(comp.find('[data-test-id="values-list-value"]')).toHaveLength(2);
    });

    test('Add a value', async () => {
        const comp = shallow(<StandardValuesList values={['value 1', 'value 2']} onValuesUpdate={onValuesUpdate} />);

        act(() => {
            comp.find('Button[data-test-id="values-list-add-btn"]').simulate('click');
        });

        expect(comp.find('[data-test-id="values-list-value"]')).toHaveLength(3);
    });

    test('Delete a value', async () => {
        const comp = mount(<StandardValuesList values={['value 1', 'value 2']} onValuesUpdate={onValuesUpdate} />);

        await act(async () => {
            comp.find('[data-test-id="values-list-value"] Input')
                .find('[data-test-id="values-list-del-btn"]')
                .at(1)
                .simulate('click');
            await wait(0);
            comp.update();
        });

        expect(onValuesUpdate).toBeCalledWith(['value 2']);
    });

    test('When editing a value, calls value update on blur', async () => {
        const comp = mount(<StandardValuesList values={['value 1', 'value 2']} onValuesUpdate={onValuesUpdate} />);

        const input = comp
            .find('[data-test-id="values-list-value"] Input')
            .find('input')
            .at(1);

        act(() => {
            input.simulate('change', {target: {value: 'new value'}});
        });

        await wait(0);
        comp.update();

        input.simulate('blur');

        expect(onValuesUpdate).toBeCalledWith(['value 1', 'new value']);
    });

    test('When editing a value, calls value update on "enter""', async () => {
        const comp = mount(<StandardValuesList values={['value 1', 'value 2']} onValuesUpdate={onValuesUpdate} />);

        const input = comp
            .find('[data-test-id="values-list-value"] Input')
            .find('input')
            .at(1);

        await act(async () => {
            input.simulate('change', {target: {value: 'new value'}});
        });

        await wait(0);
        comp.update();

        await act(async () => {
            input.simulate('keypress', {key: 'Enter'});
        });
        await wait(0);

        expect(onValuesUpdate).toBeCalledWith(['value 1', 'new value']);
    });
});
