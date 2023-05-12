// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
import {render} from 'enzyme';
import React from 'react';
import {act, create} from 'react-test-renderer';
import {mockTree} from '../../../../../../__mocks__/trees';
import TreeInfosForm from './InfosForm';

jest.mock('../../../../../../utils', () => ({
    formatIDString: jest.fn().mockImplementation(s => s),
    localizedLabel: jest.fn().mockImplementation(l => l.fr),
    getFieldError: jest.fn().mockReturnValue('')
}));
jest.mock('../../../../../../hooks/useLang');

describe('TreeInfosForm', () => {
    const onSubmit = jest.fn();
    const onCheckIdExists = jest.fn().mockReturnValue(false);

    test('Render form for existing tree', async () => {
        const comp = render(
            <MockedProvider>
                <TreeInfosForm tree={mockTree} onSubmit={onSubmit} readonly={false} onCheckIdExists={onCheckIdExists} />
            </MockedProvider>
        );
        expect(comp.find('input[name="id"]').prop('disabled')).toBe(true);
    });

    test('Render form for new tree', async () => {
        const comp = render(
            <MockedProvider>
                <TreeInfosForm tree={null} onSubmit={onSubmit} readonly={false} onCheckIdExists={onCheckIdExists} />
            </MockedProvider>
        );
        expect(comp.find('input[name="id"]').prop('disabled')).toBe(false);
    });

    test('Autofill ID with label on new lib', async () => {
        let comp;
        await act(async () => {
            comp = create(
                <MockedProvider>
                    <TreeInfosForm onSubmit={onSubmit} tree={null} readonly={false} onCheckIdExists={onCheckIdExists} />
                </MockedProvider>
            );
        });

        act(() => {
            comp.root.findByProps({name: 'label.fr'}).props.onChange(null, {
                type: 'text',
                name: 'label.fr',
                value: 'labelfr'
            });
        });

        expect(comp.root.findByProps({name: 'id'}).props.value).toBe('labelfr');
    });
});
