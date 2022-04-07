// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {fireEvent, render, screen} from '_tests/testUtils';
import {mockLibrary} from '__mocks__/libraries';
import {AttributeType} from '../../../../../../_gqlTypes/globalTypes';
import {mockAttrSimple} from '../../../../../../__mocks__/attributes';
import InfosForm from './InfosForm';

jest.mock('../../../../../../utils', () => ({
    formatIDString: jest.fn().mockImplementation(s => s),
    localizedLabel: jest.fn().mockImplementation(l => l.fr),
    getSysTranslationQueryLanguage: jest.fn().mockReturnValue(['fr', 'fr']),
    getFieldError: jest.fn().mockReturnValue('')
}));

jest.mock('../../../../../../hooks/useLang');

describe('InfosForm', () => {
    const attribute = {
        ...mockAttrSimple,
        label: {fr: 'Test 1', en: null},
        libraries: [mockLibrary]
    };
    const onSubmit = jest.fn();
    const onCheckIdExists = jest.fn().mockReturnValue(false);

    test('If attribute exists, ID and type are not editable', async () => {
        await act(async () => {
            render(
                <InfosForm
                    attribute={attribute}
                    readonly={false}
                    onSubmitInfos={onSubmit}
                    onCheckIdExists={onCheckIdExists}
                />
            );
        });

        expect(screen.getByRole('textbox', {name: 'id'})).toBeDisabled();
        expect(screen.getByRole('listbox', {name: 'type'})).toHaveAttribute('aria-disabled', 'true');
    });

    test('If attribute is new, ID and type are editable', async () => {
        await act(async () => {
            render(
                <InfosForm
                    attribute={null}
                    readonly={false}
                    onSubmitInfos={onSubmit}
                    onCheckIdExists={onCheckIdExists}
                />
            );
        });

        expect(screen.getByRole('textbox', {name: 'id'})).toBeEnabled();
        expect(screen.getByRole('listbox', {name: 'type'})).toHaveAttribute('aria-disabled', 'false');
    });

    test('If readonly, inputs are disabled', async () => {
        await act(async () => {
            render(
                <InfosForm attribute={attribute} readonly onSubmitInfos={onSubmit} onCheckIdExists={onCheckIdExists} />
            );
        });

        expect(screen.getByRole('textbox', {name: 'label.fr'})).toBeDisabled();
    });

    test('Calls onSubmit function', async () => {
        await act(async () => {
            render(
                <InfosForm
                    attribute={attribute}
                    readonly={false}
                    onSubmitInfos={onSubmit}
                    onCheckIdExists={onCheckIdExists}
                />
            );
        });

        await act(async () => {
            fireEvent.submit(screen.getByRole('form'));
        });

        expect(onSubmit).toBeCalled();
    });

    test('Autofill ID with label on new attribute', async () => {
        await act(async () => {
            render(
                <InfosForm
                    attribute={null}
                    readonly={false}
                    onSubmitInfos={onSubmit}
                    onCheckIdExists={onCheckIdExists}
                />
            );
        });

        await act(async () => {
            await userEvent.type(screen.getByRole('textbox', {name: 'label.fr'}), 'labelfr', {delay: 5});
        });

        expect(screen.getByRole('textbox', {name: 'id'})).toHaveValue('labelfr');
    });

    test('Validate ID unicity', async () => {
        const _idNotUnique = jest.fn().mockResolvedValue(false);

        await act(async () => {
            render(
                <InfosForm attribute={null} readonly={false} onSubmitInfos={onSubmit} onCheckIdExists={_idNotUnique} />
            );
        });

        await act(async () => {
            await userEvent.type(screen.getByRole('textbox', {name: 'id'}), 'test');
        });

        expect(_idNotUnique).toBeCalled();
    });

    test('Can force values on new attribute', async () => {
        await act(async () => {
            render(
                <InfosForm
                    attribute={null}
                    readonly={false}
                    onSubmitInfos={onSubmit}
                    onCheckIdExists={onCheckIdExists}
                    forcedType={AttributeType.advanced}
                />
            );
        });

        expect(screen.getByRole('option', {name: /advanced$/})).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByRole('listbox', {name: 'type'})).toHaveAttribute('aria-disabled', 'true');
    });
});
