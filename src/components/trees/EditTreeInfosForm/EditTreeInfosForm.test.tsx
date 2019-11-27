import {MockedProvider} from '@apollo/react-testing';
import {render} from 'enzyme';
import React from 'react';
import {act, create} from 'react-test-renderer';
import EditTreeInfosForm from './EditTreeInfosForm';

jest.mock('../../../utils/utils', () => ({
    formatIDString: jest.fn().mockImplementation(s => s),
    localizedLabel: jest.fn().mockImplementation(l => l.fr),
    getFieldError: jest.fn().mockReturnValue(''),
    getSysTranslationQueryLanguage: jest.fn().mockReturnValue(v => ['fr', 'fr'])
}));
jest.mock('../../../hooks/useLang', () => jest.fn().mockReturnValue(['fr']));

describe('EditTreeInfosForm', () => {
    const mockTree = {
        id: 'test',
        label: {fr: 'Test'},
        system: false,
        libraries: ['test_lib']
    };
    const onSubmit = jest.fn();
    const onCheckIdExists = jest.fn().mockReturnValue(false);

    test('Render form for existing tree', async () => {
        const comp = render(
            <MockedProvider>
                <EditTreeInfosForm
                    tree={mockTree}
                    onSubmit={onSubmit}
                    readOnly={false}
                    onCheckIdExists={onCheckIdExists}
                />
            </MockedProvider>
        );
        expect(comp.find('input[name="id"]').prop('disabled')).toBe(true);
    });

    test('Render form for new tree', async () => {
        const comp = render(
            <MockedProvider>
                <EditTreeInfosForm tree={null} onSubmit={onSubmit} readOnly={false} onCheckIdExists={onCheckIdExists} />
            </MockedProvider>
        );
        expect(comp.find('input[name="id"]').prop('disabled')).toBe(false);
    });

    test('Autofill ID with label on new lib', async () => {
        let comp;
        await act(async () => {
            comp = create(
                <MockedProvider>
                    <EditTreeInfosForm
                        onSubmit={onSubmit}
                        tree={null}
                        readOnly={false}
                        onCheckIdExists={onCheckIdExists}
                    />
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
