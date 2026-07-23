import '@testing-library/jest-dom';
import {onTestFinished} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {KitApp} from 'aristid-ds';
import {mockAttrSimple} from '../../../../../../../../../../__mocks__/attributes';
import MockedProviderWithFragments from '../../../../../../../../../../__mocks__/MockedProviderWithFragments';
import * as useFormBuilderReducer from '../../formBuilderReducer/hook/useFormBuilderReducer';
import {formElem1, mockInitialState} from '../../formBuilderReducer/_fixtures/fixtures';
import {formElements} from '../../uiElements';
import {FieldTypes, FormElementSettingsInputTypes} from '../../_types';
import SettingsEdition from './SettingsEdition';
import {GetAttributeByIdDocument} from '../../../../../../../../../../_gqlTypes';

vi.mock('../../../../../../../../../attributes/AttributeSelector', () => ({
    default: function AttributeSelector() {
        return <div>AttributeSelector</div>;
    },
}));
const mockState = {
    ...mockInitialState,
    openSettings: true,
};

const renderWithAttributesMock = (children: JSX.Element) => {
    const mocks = [
        {
            request: {
                query: GetAttributeByIdDocument,
                variables: {
                    id: formElem1.settings.attribute,
                },
            },
            result: {
                data: {
                    attributes: {
                        __typename: 'AttributesList',
                        totalCount: 0,
                        list: [
                            {
                                ...mockAttrSimple,
                                __typename: 'Attribute',
                                id: formElem1.settings.attribute,
                                versions_conf: null,
                            },
                        ],
                    },
                },
            },
        },
    ];

    return render(
        <KitApp>
            <MockedProviderWithFragments mocks={mocks}>{children}</MockedProviderWithFragments>
        </KitApp>,
    );
};

describe('SettingsEdition', () => {
    test('Text Input', async () => {
        vi.spyOn(useFormBuilderReducer, 'useFormBuilderReducer').mockReturnValue({
            state: {
                ...mockState,
                elementInSettings: {
                    ...formElem1,
                    uiElement: {
                        ...formElements[FieldTypes.TEXT_INPUT],
                        settings: [
                            {
                                name: 'myinput',
                                inputType: FormElementSettingsInputTypes.INPUT,
                            },
                        ],
                    },
                    settings: {...formElem1.settings, myinput: 'input value'},
                },
            },
            dispatch: vi.fn(),
        });

        renderWithAttributesMock(<SettingsEdition />);

        await waitFor(() => screen.getByRole('textbox'));

        expect(screen.getByRole('textbox')).toHaveDisplayValue('input value');
    });

    test('Select', async () => {
        vi.spyOn(useFormBuilderReducer, 'useFormBuilderReducer').mockReturnValue({
            state: {
                ...mockState,
                elementInSettings: {
                    ...formElem1,
                    uiElement: {
                        ...formElements[FieldTypes.TEXT_INPUT],
                        settings: [
                            {
                                name: 'mySelect',
                                inputType: FormElementSettingsInputTypes.SELECT,
                                getInputSettings: () => ({
                                    options: ['option1', 'option2'],
                                }),
                            },
                        ],
                    },
                    settings: {...formElem1.settings, mySelect: 'option1'},
                },
            },
            dispatch: vi.fn(),
        });

        renderWithAttributesMock(<SettingsEdition />);

        await waitFor(() => screen.getAllByRole('option'));

        expect(screen.getByRole('option', {name: /option1/i})).toBeInTheDocument();
        expect(screen.getByRole('option', {name: /option2/i})).toBeInTheDocument();
        expect(!!screen.getByRole('option', {name: /option1/i}).attributes['aria-selected'].value).toBe(true);
    });

    test('Checkbox', async () => {
        vi.spyOn(useFormBuilderReducer, 'useFormBuilderReducer').mockReturnValue({
            state: {
                ...mockState,
                elementInSettings: {
                    ...formElem1,
                    uiElement: {
                        ...formElements[FieldTypes.TEXT_INPUT],
                        settings: [
                            {
                                name: 'myCheckbox',
                                inputType: FormElementSettingsInputTypes.CHECKBOX,
                            },
                        ],
                    },
                    settings: {...formElem1.settings, myCheckbox: true},
                },
            },
            dispatch: vi.fn(),
        });

        renderWithAttributesMock(<SettingsEdition />);
        await waitFor(() => screen.getByRole('checkbox'));

        expect(screen.getByRole('checkbox')).toBeInTheDocument();
        expect(screen.getByRole('checkbox')).toBeChecked();
    });

    test('Attribute', async () => {
        vi.spyOn(useFormBuilderReducer, 'useFormBuilderReducer').mockReturnValue({
            state: {
                ...mockState,
                elementInSettings: {
                    ...formElem1,
                    uiElement: {
                        ...formElements[FieldTypes.TEXT_INPUT],
                        settings: [
                            {
                                name: 'myAttribute',
                                inputType: FormElementSettingsInputTypes.ATTRIBUTE_SELECTION,
                            },
                        ],
                    },
                    settings: {...formElem1.settings},
                },
            },
            dispatch: vi.fn(),
        });

        renderWithAttributesMock(<SettingsEdition />);
        await waitFor(() => screen.getByText('AttributeSelector'));

        expect(screen.getByText('AttributeSelector')).toBeInTheDocument();
    });

    test('RTE', async () => {
        // happy-dom (CI) returns empty strings for the textarea's computed padding/border/line-height,
        // so antd's `Input.TextArea` autoSize computes `NaN` for its height and React logs
        // "`NaN` is an invalid value for the `height` css style property". Coerce every empty numeric
        // value read through `getPropertyValue` to `0px` (product code is correct; this is purely a
        // happy-dom measurement gap). The autoSize measurement can also fire in the setup-level
        // afterEach act() flush, i.e. after the test body — restore through onTestFinished (which runs
        // after all afterEach hooks), not at the end of the test body.
        const realGetComputedStyle = window.getComputedStyle.bind(window);
        const getComputedStyleSpy = vi
            .spyOn(window, 'getComputedStyle')
            .mockImplementation((element: Element, pseudoElement?: string | null) => {
                const style = realGetComputedStyle(element, pseudoElement ?? undefined);
                return new Proxy(style, {
                    get(target, prop) {
                        if (prop === 'getPropertyValue') {
                            return (name: string) => {
                                const value = target.getPropertyValue(name);
                                return value === '' && /padding|border|width|height|size/.test(name) ? '0px' : value;
                            };
                        }
                        const value = Reflect.get(target, prop);
                        return typeof value === 'function' ? value.bind(target) : value;
                    },
                });
            });
        onTestFinished(() => {
            getComputedStyleSpy.mockRestore();
        });

        vi.spyOn(useFormBuilderReducer, 'useFormBuilderReducer').mockReturnValue({
            state: {
                ...mockState,
                elementInSettings: {
                    ...formElem1,
                    uiElement: {
                        ...formElements[FieldTypes.TEXT_INPUT],
                        settings: [
                            {
                                name: 'myRTE',
                                inputType: FormElementSettingsInputTypes.RTE,
                            },
                        ],
                    },
                    settings: {...formElem1.settings, myRTE: '**Content**'},
                },
            },
            dispatch: vi.fn(),
        });

        renderWithAttributesMock(<SettingsEdition />);
        await waitFor(() => screen.getByTestId('rte-editor-wrapper'));

        expect(screen.getByRole('textbox')).toHaveDisplayValue('**Content**');
    });

    test('None', async () => {
        vi.spyOn(useFormBuilderReducer, 'useFormBuilderReducer').mockReturnValue({
            state: {
                ...mockState,
                elementInSettings: {
                    ...formElem1,
                    uiElement: {
                        ...formElements[FieldTypes.TEXT_INPUT],
                        settings: [
                            {
                                name: 'myNoDisplaySettings',
                                inputType: FormElementSettingsInputTypes.NONE,
                            },
                        ],
                    },
                    settings: {...formElem1.settings, myNoDisplaySettings: 'some_value'},
                },
            },
            dispatch: vi.fn(),
        });

        renderWithAttributesMock(<SettingsEdition />);
        await waitFor(() => screen.getByRole('form'));

        expect(screen.getByRole('form')).toHaveTextContent('');
    });
});
