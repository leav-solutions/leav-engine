// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {ITableCell} from '_ui/types/search';
import {AttributeFormat, AttributeType} from '_ui/_gqlTypes';
import {render, screen, waitFor} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import Cell from './Cell';

describe('Cell', () => {
    describe('with standard value', () => {
        it('should display the value', async () => {
            const mockData = {
                id: 'id',
                value: [{value: 'test_value'}],
                type: AttributeType.simple,
                format: AttributeFormat.text
            };

            render(<Cell columnName="test" data={(mockData as unknown) as ITableCell} onCellInfosEdit={() => null} />);

            expect(screen.getByText('test_value')).toBeVisible();
        });

        it('should display inherited value', async () => {
            const mockData = {
                id: 'id',
                value: [
                    {value: null, isInherited: null},
                    {value: 'valueInherited', isInherited: true}
                ],
                type: AttributeType.simple,
                format: AttributeFormat.text
            };

            render(<Cell columnName="test" data={(mockData as unknown) as ITableCell} onCellInfosEdit={() => null} />);

            expect(screen.getByText('valueInherited')).toBeVisible();
        });

        it('should display override value', async () => {
            const mockData = {
                id: 'id',
                value: [
                    {value: 'valueInherited', isInherited: true},
                    {value: 'valueOverride', isInherited: false}
                ],
                type: AttributeType.simple,
                format: AttributeFormat.text
            };

            render(<Cell columnName="test" data={(mockData as unknown) as ITableCell} onCellInfosEdit={() => null} />);

            expect(screen.queryByText('valueInherited')).not.toBeInTheDocument();
            expect(screen.getByText('valueOverride')).toBeVisible();
        });
    });

    describe('with standard multiple values', () => {
        it('should display all values', async () => {
            const mockData = {
                id: 'id',
                value: [{value: 'valueA'}, {value: 'valueB'}],
                type: AttributeType.advanced,
                format: AttributeFormat.text
            };

            render(<Cell columnName="test" data={(mockData as unknown) as ITableCell} onCellInfosEdit={() => null} />);

            expect(screen.getByText(/valueA(.*)valueB/)).toBeVisible();
        });

        it('should display inherited values', async () => {
            const mockData = {
                id: 'id',
                value: [
                    {value: null, isInherited: null},
                    {value: 'valueInheritedA', isInherited: true},
                    {value: 'valueInheritedB', isInherited: true}
                ],
                type: AttributeType.advanced,
                format: AttributeFormat.text
            };

            render(<Cell columnName="test" data={(mockData as unknown) as ITableCell} onCellInfosEdit={() => null} />);

            expect(screen.getByText(/valueInheritedA(.*)valueInheritedB/)).toBeVisible();
        });

        it('should display override values', async () => {
            const mockData = {
                id: 'id',
                value: [
                    {value: 'valueOverrideA', isInherited: false},
                    {value: 'valueOverrideB', isInherited: false},
                    {value: 'valueInheritedA', isInherited: true},
                    {value: 'valueInheritedB', isInherited: true}
                ],
                type: AttributeType.advanced,
                format: AttributeFormat.text
            };

            render(<Cell columnName="test" data={(mockData as unknown) as ITableCell} onCellInfosEdit={() => null} />);

            expect(screen.getByText(/valueOverrideA(.*)valueOverrideB/)).toBeVisible();
            expect(screen.queryByText(/valueInheritedA(.*)valueInheritedB/)).not.toBeInTheDocument();
        });
    });

    describe('with link value', () => {
        it('should display linked record label', async () => {
            const mockData = {
                id: 'id',
                value: [{linkValue: {id: mockRecord.id, whoAmI: mockRecord}}],
                type: AttributeType.simple_link,
                format: AttributeFormat.text
            };

            render(<Cell columnName="test" data={(mockData as unknown) as ITableCell} onCellInfosEdit={() => null} />);

            expect(screen.getByText(mockRecord.label)).toBeVisible();
        });

        it('should display inherited linked record label', async () => {
            const mockData = {
                id: 'id',
                value: [
                    {linkValue: null, isInherited: null},
                    {linkValue: {id: mockRecord.id, whoAmI: mockRecord}, isInherited: true}
                ],
                type: AttributeType.simple_link,
                format: AttributeFormat.text
            };

            render(<Cell columnName="test" data={(mockData as unknown) as ITableCell} onCellInfosEdit={() => null} />);

            expect(screen.getByText(mockRecord.label)).toBeVisible();
        });

        it('should display override linked record label', async () => {
            const overrideLabel = 'override_label';
            const mockData = {
                id: 'id',
                value: [
                    {linkValue: {id: mockRecord.id, whoAmI: {...mockRecord, label: overrideLabel}}, isInherited: false},
                    {linkValue: {id: mockRecord.id, whoAmI: mockRecord}, isInherited: true}
                ],
                type: AttributeType.simple_link,
                format: AttributeFormat.text
            };

            render(<Cell columnName="test" data={(mockData as unknown) as ITableCell} onCellInfosEdit={() => null} />);

            expect(screen.getByText(overrideLabel)).toBeVisible();
        });
    });

    describe('with multiple link values', () => {
        it('should display all linked record labels', async () => {
            const mockData = {
                id: 'id',
                value: [
                    {linkValue: {id: mockRecord.id, whoAmI: mockRecord}},
                    {linkValue: {id: 'record2', whoAmI: {...mockRecord, id: 'record2', label: 'record2'}}},
                    {linkValue: {id: 'record3', whoAmI: {...mockRecord, id: 'record3', label: 'record3'}}}
                ],
                type: AttributeType.simple_link,
                format: AttributeFormat.text
            };

            render(<Cell columnName="test" data={(mockData as unknown) as ITableCell} onCellInfosEdit={() => null} />);

            expect(screen.getByText(mockRecord.label)).toBeVisible();
            expect(screen.queryByText('record2')).not.toBeInTheDocument();
            expect(screen.queryByText('record3')).not.toBeInTheDocument();
            expect(screen.getByText('3')).toBeVisible();

            await userEvent.hover(screen.getByText('3'));

            await waitFor(() => {
                const listItems = screen.getAllByRole('listitem');

                expect(listItems.map(item => item.textContent)).toEqual(['record_label', 'record2', 'record3']);
                listItems.forEach(item => expect(item).toBeVisible());
            });
        });

        it('should display all inherited linked record labels', async () => {
            const mockData = {
                id: 'id',
                value: [
                    {linkValue: null, isInherited: null},
                    {
                        linkValue: {id: 'record2', whoAmI: {...mockRecord, id: 'record2', label: 'record2'}},
                        isInherited: true
                    },
                    {
                        linkValue: {id: 'record3', whoAmI: {...mockRecord, id: 'record3', label: 'record3'}},
                        isInherited: true
                    }
                ],
                type: AttributeType.simple_link,
                format: AttributeFormat.text
            };

            render(<Cell columnName="test" data={(mockData as unknown) as ITableCell} onCellInfosEdit={() => null} />);

            expect(screen.getByText('record2')).toBeVisible();
            expect(screen.queryByText('record3')).not.toBeInTheDocument();
            expect(screen.getByText('2')).toBeVisible();

            await userEvent.hover(screen.getByText('2'));

            await waitFor(() => {
                const listItems = screen.getAllByRole('listitem');

                expect(listItems.map(item => item.textContent)).toEqual(['record2', 'record3']);
                listItems.forEach(item => expect(item).toBeVisible());
            });
        });

        it('should display all override linked record labels', async () => {
            const mockData = {
                id: 'id',
                value: [
                    {linkValue: null, isInherited: null},
                    {
                        linkValue: {id: 'record2', whoAmI: {...mockRecord, id: 'record2', label: 'record2'}},
                        isInherited: false
                    },
                    {
                        linkValue: {id: 'record3', whoAmI: {...mockRecord, id: 'record3', label: 'record3'}},
                        isInherited: false
                    },
                    {
                        linkValue: {id: 'record4', whoAmI: {...mockRecord, id: 'record4', label: 'record4'}},
                        isInherited: true
                    },
                    {
                        linkValue: {id: 'record5', whoAmI: {...mockRecord, id: 'record5', label: 'record5'}},
                        isInherited: true
                    }
                ],
                type: AttributeType.simple_link,
                format: AttributeFormat.text
            };

            render(<Cell columnName="test" data={(mockData as unknown) as ITableCell} onCellInfosEdit={() => null} />);

            expect(screen.getByText('record2')).toBeVisible();
            expect(screen.queryByText('record3')).not.toBeInTheDocument();
            expect(screen.queryByText('record4')).not.toBeInTheDocument();
            expect(screen.queryByText('record5')).not.toBeInTheDocument();
            expect(screen.getByText('2')).toBeVisible();

            await userEvent.hover(screen.getByText('2'));

            await waitFor(() => {
                const listItems = screen.getAllByRole('listitem');

                expect(listItems.map(item => item.textContent)).toEqual(['record2', 'record3']);
                listItems.forEach(item => expect(item).toBeVisible());
            });
        });
    });
});
