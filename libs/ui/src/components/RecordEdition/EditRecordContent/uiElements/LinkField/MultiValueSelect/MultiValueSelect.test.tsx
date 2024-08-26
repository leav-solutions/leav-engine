// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {MultiValueSelect} from './MultiValueSelect';
import {mockFormElementInput, mockFormElementLink} from '_ui/__mocks__/common/form';
import {LinkFieldReducerState} from '../LinkField';
import {mockAttributeLink} from '_ui/__mocks__/common/attribute';
import {APICallStatus, FieldScope} from '../../../_types';
import {mockRecord} from '_ui/__mocks__/common/record';
import {AntForm} from 'aristid-ds';
import userEvent from '@testing-library/user-event';
import {getRecordsFromLibraryQuery} from '_ui/_queries/records/getRecordsFromLibraryQuery';
import {AttributeType, SortOrder} from '_ui/_gqlTypes';
import {MockedResponse} from '@apollo/client/testing';
import {RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';

describe('<MultiValueSelect />', () => {
    const onSelectChangeMock = jest.fn();
    const onClearSelectMock = jest.fn();
    const onValueDeselectMock = jest.fn();

    const records = {
        __typename: 'RecordList',
        list: [
            {
                id: '28121951',
                _id: '28121951',
                whoAmI: {
                    id: '28121951',
                    label: 'Danette pistache',
                    subLabel: null,
                    preview: null,
                    library: {
                        id: 'id_library',
                        label: null
                    },
                    color: null
                },
                __typename: 'Record'
            },
            {
                id: '15061943',
                _id: '15061943',
                whoAmI: {
                    id: '15061943',
                    label: 'Danette chocolat',
                    subLabel: null,
                    preview: null,
                    library: {
                        id: 'id_library',
                        label: null
                    },
                    color: null
                },
                __typename: 'Record'
            }
        ],
        totalCount: 2
    };

    const mocks: MockedResponse[] = [
        {
            request: {
                query: getRecordsFromLibraryQuery(),
                variables: {library: 'test_lib', limit: 1000, sort: {field: 'label', order: SortOrder.asc}}
            },
            result: {data: {records}}
        }
    ];

    const state: LinkFieldReducerState = {
        errorMessage: 'This is an error message',
        isValuesAddVisible: false,
        record: mockRecord,
        formElement: {
            ...mockFormElementInput,
            settings: {
                label: 'label',
                required: true
            }
        },
        attribute: mockAttributeLink,
        isReadOnly: false,
        activeScope: FieldScope.CURRENT,
        values: {
            [FieldScope.CURRENT]: null,
            [FieldScope.INHERITED]: null
        }
    };

    afterEach(() => {
        onSelectChangeMock.mockClear();
        onClearSelectMock.mockClear();
        onValueDeselectMock.mockClear();
    });

    it('should display MultiValueSelect with no active value', async () => {
        render(
            <AntForm name="name">
                <AntForm.Item name="danette">
                    <MultiValueSelect
                        activeValues={undefined}
                        attribute={mockFormElementLink.attribute}
                        label={state.formElement.settings.label}
                        onSelectChange={onSelectChangeMock}
                        onSelectClear={onClearSelectMock}
                        onValueDeselect={onValueDeselectMock}
                        fieldValue={null}
                    />
                </AntForm.Item>
            </AntForm>,
            {mocks}
        );

        expect(screen.queryByText('Danette pistache')).not.toBeInTheDocument();
        expect(screen.queryByText('Danette chocolat')).not.toBeInTheDocument();

        const select = screen.getByRole('combobox');
        await userEvent.click(select);

        const options = screen.getAllByRole('option');
        expect(options.length).toBe(records.list.length);

        const danettePistache = screen.getByText('Danette pistache');
        expect(danettePistache).toBeVisible();

        const danetteChocolat = screen.getByText('Danette chocolat');
        expect(danetteChocolat).toBeVisible();
        await userEvent.click(danetteChocolat);

        expect(onSelectChangeMock).toBeCalledTimes(1);
        expect(onSelectChangeMock).toHaveBeenCalledWith([records.list[1]]);
    });

    // Does not work with current DS
    it.skip('should display MultiValueSelect with default active value', async () => {
        onClearSelectMock.mockResolvedValueOnce({res: {status: APICallStatus.SUCCESS}});
        const id_value = '11051999';

        render(
            <AntForm name="name" initialValues={{danette: [records.list[1].id]}}>
                <AntForm.Item name="danette">
                    <MultiValueSelect
                        activeValues={[
                            {
                                id_value,
                                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                                linkValue: {
                                    id: records.list[1].id,
                                    whoAmI: {}
                                } as RecordFormElementsValueLinkValue['linkValue'],
                                attribute: {
                                    id: mockFormElementLink.attribute.id,
                                    type: AttributeType.simple_link,
                                    system: false
                                }
                            }
                        ]}
                        attribute={mockFormElementLink.attribute}
                        label={state.formElement.settings.label}
                        onSelectChange={onSelectChangeMock}
                        onSelectClear={onClearSelectMock}
                        onValueDeselect={onValueDeselectMock}
                        fieldValue={null}
                    />
                </AntForm.Item>
            </AntForm>,
            {mocks}
        );

        // const defaultValue = await screen.findByText('Danette chocolat'); // TODO uncomment and remove next line when select defaultValue is fixed in DS
        const defaultValue = await screen.findByText('15061943');
        expect(defaultValue).toBeVisible();

        const select = screen.getByRole('combobox');
        await userEvent.click(select);

        const options = screen.getAllByRole('option');
        expect(options.length).toBe(records.list.length);

        const danettePistache = screen.getByText('Danette pistache');
        expect(danettePistache).toBeVisible();
        await userEvent.click(danettePistache);

        expect(onSelectChangeMock).toBeCalledTimes(1);
        expect(onSelectChangeMock).toHaveBeenCalledWith([records.list[0]]);
    });

    describe('clear icons', () => {
        const activeValues = [
            {
                id_value: 'something',
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                linkValue: {
                    id: records.list[0].id,
                    whoAmI: {}
                } as RecordFormElementsValueLinkValue['linkValue'],
                attribute: {
                    id: mockFormElementLink.attribute.id,
                    type: AttributeType.simple_link,
                    system: false
                }
            },
            {
                id_value: 'something_else',
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                linkValue: {
                    id: records.list[1].id,
                    whoAmI: {}
                } as RecordFormElementsValueLinkValue['linkValue'],
                attribute: {
                    id: mockFormElementLink.attribute.id,
                    type: AttributeType.simple_link,
                    system: false
                }
            }
        ];

        it('should clear all elements on click on clear icon', async () => {
            render(
                <AntForm name="name" initialValues={{danette: [records.list[0].id, records.list[1].id]}}>
                    <AntForm.Item name="danette">
                        <MultiValueSelect
                            activeValues={activeValues}
                            attribute={mockFormElementLink.attribute}
                            label={state.formElement.settings.label}
                            onSelectChange={onSelectChangeMock}
                            onSelectClear={onClearSelectMock}
                            onValueDeselect={onValueDeselectMock}
                            fieldValue={null}
                        />
                    </AntForm.Item>
                </AntForm>,
                {mocks}
            );
            const clearIcon = screen.getByLabelText('clear');

            await userEvent.click(clearIcon);

            expect(onClearSelectMock).toHaveBeenCalledTimes(1);
            expect(onClearSelectMock).toHaveBeenCalledWith();
        });

        it('should clear one element from selection on click on close icon', async () => {
            const {container} = render(
                <AntForm name="name" initialValues={{danette: [records.list[0].id, records.list[1].id]}}>
                    <AntForm.Item name="danette">
                        <MultiValueSelect
                            activeValues={activeValues}
                            attribute={mockFormElementLink.attribute}
                            label={state.formElement.settings.label}
                            onSelectChange={onSelectChangeMock}
                            onSelectClear={onClearSelectMock}
                            onValueDeselect={onValueDeselectMock}
                            fieldValue={null}
                        />
                    </AntForm.Item>
                </AntForm>,
                {mocks}
            );

            const clearIcons = container.getElementsByClassName('ant-tag-close-icon');

            await userEvent.click(clearIcons[1]);
            expect(onValueDeselectMock).toHaveBeenCalledTimes(1);
            expect(onValueDeselectMock).toHaveBeenCalledWith({
                attribute: {id: 'test_attribute', system: false, type: 'simple_link'},
                id_value: 'something_else',
                linkValue: {id: '15061943', whoAmI: {}}
            });

            await userEvent.click(clearIcons[0]);
            expect(onValueDeselectMock).toHaveBeenCalledTimes(2);
            expect(onValueDeselectMock).toHaveBeenCalledWith({
                attribute: {id: 'test_attribute', system: false, type: 'simple_link'},
                id_value: 'something',
                linkValue: {id: '28121951', whoAmI: {}}
            });
        });
    });
});
