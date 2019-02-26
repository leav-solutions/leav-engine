import {mount} from 'enzyme';
import 'jest-styled-components';
import React from 'react';
import renderer from 'react-test-renderer';
import PermissionSelector from './PermissionSelector';

describe('PermissionSelector', () => {
    const onChange = jest.fn();
    test('Snapshot testing', async () => {
        const comp = renderer.create(
            <PermissionSelector
                as={'div'}
                value
                heritValue={false}
                onChange={onChange}
                forbiddenColor="#FF0000"
                allowedColor="#00FF00"
            />
        );

        expect(comp.toJSON()).toMatchSnapshot();
    });

    test('Display "allowed" selector', async () => {
        const comp = mount(
            <PermissionSelector
                as={'div'}
                value
                heritValue={false}
                onChange={onChange}
                forbiddenColor="#FF0000"
                allowedColor="#00FF00"
            />
        );

        expect(comp.find('Wrapper')).toHaveStyleRule('background', '#00FF00');
        expect(comp.find('Input').prop('value')).toBe(2);
    });

    test('Display "herit" selector', async () => {
        const comp = mount(
            <PermissionSelector
                as={'div'}
                value={null}
                heritValue={false}
                onChange={onChange}
                forbiddenColor="#FF0000"
                allowedColor="#00FF00"
            />
        );

        expect(comp.find('Wrapper')).toHaveStyleRule('background', 'rgba(1,2,3,0.5)');
        expect(comp.find('Input').prop('value')).toBe(1);
    });

    test('Display "forbidden" selector', async () => {
        const comp = mount(
            <PermissionSelector
                as={'div'}
                value={false}
                heritValue={false}
                onChange={onChange}
                forbiddenColor="#FF0000"
                allowedColor="#00FF00"
            />
        );

        expect(comp.find('Wrapper')).toHaveStyleRule('background', '#FF0000');
        expect(comp.find('Input').prop('value')).toBe(0);
    });

    test('Calls onchange function', async () => {
        const comp = mount(
            <PermissionSelector
                as={'div'}
                value
                heritValue={false}
                onChange={onChange}
                forbiddenColor="#FF0000"
                allowedColor="#00FF00"
            />
        );

        comp.find('input').simulate('change', {target: {value: 0}});

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][0]).toBe(false);
    });
});
