// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {getLibrariesWithAttributesQuery} from 'queries/libraries/getLibrariesWithAttributesQuery';
import {saveLibAttributesMutation} from 'queries/libraries/saveLibAttributesMutation';
import {act} from 'react-dom/test-utils';
import {fireEvent, render, screen, waitFor, within} from '_tests/testUtils';
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

jest.mock('components/versionProfiles/VersionProfilesSelector', () => function VersionProfilesSelector() {
        return <div>VersionProfilesSelector</div>;
    });

describe('InfosForm', () => {
    const attribute = {
        ...mockAttrSimple,
        label: {fr: 'Test 1', en: null},
        libraries: [mockLibrary]
    };
    const onSubmit = jest.fn();
    const onCheckIdExists = jest.fn().mockReturnValue(false);

    const mockLibrariesWithAttributes = {
        request: {
            query: getLibrariesWithAttributesQuery,
            variables: {}
        },
        result: {
            data: {
                libraries: {
                    totalCount: 1,
                    list: [
                        {
                            id: 'products',
                            label: {
                                en: '',
                                fr: 'Produits'
                            },
                            attributes: [
                                {
                                    id: 'id',
                                    label: {
                                        fr: 'Identifiant',
                                        en: 'Identifier'
                                    },
                                    __typename: 'StandardAttribute'
                                }
                            ],
                            __typename: 'Library'
                        },
                        {
                            id: 'categories',
                            label: {
                                en: '',
                                fr: 'Categories'
                            },
                            attributes: [
                                {
                                    id: 'id',
                                    label: {
                                        fr: 'Identifiant',
                                        en: 'Identifier'
                                    },
                                    __typename: 'StandardAttribute'
                                }
                            ],
                            __typename: 'Library'
                        }
                    ],
                    __typename: 'LibrariesList'
                }
            }
        }
    };

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
        const mocks = [mockLibrariesWithAttributes];
        await act(async () => {
            render(
                <InfosForm
                    attribute={attribute}
                    readonly={false}
                    onSubmitInfos={onSubmit}
                    onCheckIdExists={onCheckIdExists}
                />,
                {apolloMocks: mocks}
            );
        });

        await act(async () => {
            fireEvent.submit(screen.getByRole('form'));
        });

        await waitFor(() => expect(onSubmit).toBeCalled());
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

    test('Manage libraries linked to attribute', async () => {
        let saveLibCalled = false;
        const mocks = [
            mockLibrariesWithAttributes,
            {
                request: {
                    query: saveLibAttributesMutation,
                    variables: {
                        libId: 'categories',
                        attributes: ['id', attribute.id]
                    }
                },
                result: () => {
                    saveLibCalled = true;

                    return {};
                }
            }
        ];
        await act(async () => {
            render(
                <InfosForm
                    attribute={attribute}
                    readonly={false}
                    onSubmitInfos={onSubmit}
                    onCheckIdExists={onCheckIdExists}
                    forcedType={AttributeType.advanced}
                />,
                {apolloMocks: mocks}
            );
        });

        const librariesWrapper = await screen.findByRole('combobox', {name: 'linked-libraries'});

        expect(await within(librariesWrapper).findByText('Produits')).toBeInTheDocument();

        await act(async () => {
            await userEvent.type(within(librariesWrapper).getByRole('textbox'), 'categ', {delay: 5});
            userEvent.click(within(librariesWrapper).getByText('Categories'));
        });

        expect(saveLibCalled).toBe(true);
    });
});
