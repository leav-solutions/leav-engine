import {mount, shallow} from 'enzyme';
import * as React from 'react';
import PermissionSelector from './PermissionSelector';

describe('PermissionSelector', () => {
    const onChange = jest.fn();
    test('Display "allowed" selector', async () => {
        const comp = shallow(
            <PermissionSelector as={'div'} value onChange={onChange} forbiddenColor="#FF0000" allowedColor="#00FF00" />
        );

        expect(comp.find('div')).toHaveLength(1);
        expect(comp.find('div').prop('style')!.background).toBe('#00FF00');
        expect(comp.find('Input').prop('defaultValue')).toBe(2);
    });

    test('Display "herit" selector', async () => {
        const comp = shallow(
            <PermissionSelector
                as={'div'}
                value={null}
                onChange={onChange}
                forbiddenColor="#FF0000"
                allowedColor="#00FF00"
            />
        );

        expect(comp.find('div').prop('style')!.background).toBe('#FFFFFF');
        expect(comp.find('Input').prop('defaultValue')).toBe(1);
    });

    test('Display "forbidden" selector', async () => {
        const comp = shallow(
            <PermissionSelector
                as={'div'}
                value={false}
                onChange={onChange}
                forbiddenColor="#FF0000"
                allowedColor="#00FF00"
            />
        );

        expect(comp.find('div').prop('style')!.background).toBe('#FF0000');
        expect(comp.find('Input').prop('defaultValue')).toBe(0);
    });

    test('Calls onchange function', async () => {
        const comp = mount(
            <PermissionSelector as={'div'} value onChange={onChange} forbiddenColor="#FF0000" allowedColor="#00FF00" />
        );

        comp.find('input').simulate('change', {target: {value: 0}});

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][0]).toBe(false);
    });
});
