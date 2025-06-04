// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ResizeObserver from 'resize-observer-polyfill';
import {render, screen} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import {
    AttributePropertiesFragment,
    AttributeType,
    MultiLinkDisplayOption,
    PropertyValueLinkValueFragment
} from '_ui/_gqlTypes';
import {TableCell} from './TableCell';

global.ResizeObserver = ResizeObserver;

describe('TableCell component', () => {
    describe('multiple link value', () => {
        const linkValues: PropertyValueLinkValueFragment[] = [
            {
                linkPayload: {
                    id: 'multivalRecord1',
                    whoAmI: {...mockRecord, preview: null, label: 'Record A'}
                }
            },
            {
                linkPayload: {
                    id: 'multivalRecord2',
                    whoAmI: {...mockRecord, preview: null, label: 'Record B'}
                }
            },
            {
                linkPayload: {
                    id: 'multivalRecord3',
                    whoAmI: {...mockRecord, preview: null, label: 'Record C'}
                }
            },
            {
                linkPayload: {
                    id: 'multivalRecord4',
                    whoAmI: {...mockRecord, preview: null, label: 'Record D'}
                }
            },
            {
                linkPayload: {id: 'multivalRecord5', whoAmI: {...mockRecord, label: 'Record E'}}
            },
            {
                linkPayload: {id: 'multivalRecord6', whoAmI: {...mockRecord, label: 'Record F'}}
            },
            {
                linkPayload: {id: 'multivalRecord7', whoAmI: {...mockRecord, label: 'Record G'}}
            }
        ];

        test('Should display list of avatar as default', async () => {
            const attributeProperties: AttributePropertiesFragment = {
                id: 'default',
                multiple_values: true,
                multi_link_display_option: MultiLinkDisplayOption.avatar,
                type: AttributeType.advanced_link
            };

            render(<TableCell values={linkValues} attributeProperties={attributeProperties} />);

            expect(screen.getByText('RA')).toBeVisible();
            expect(screen.getByText('RB')).toBeVisible();
            expect(screen.getByText('RC')).toBeVisible();
            expect(screen.getByText('RD')).toBeVisible();
            expect(screen.getByRole('img')).toHaveAttribute('src', mockRecord.preview?.small);
            expect(screen.getByText('+2')).toBeVisible();
        });

        test('Should display only quantity of links', async () => {
            const attributeProperties: AttributePropertiesFragment = {
                id: 'default',
                multiple_values: true,
                multi_link_display_option: MultiLinkDisplayOption.badge_qty,
                type: AttributeType.advanced_link
            };

            render(<TableCell values={linkValues} attributeProperties={attributeProperties} />);

            expect(screen.getByText(linkValues.length)).toBeVisible();
        });

        test('Should display list of tag', async () => {
            const attributeProperties: AttributePropertiesFragment = {
                id: 'default',
                multiple_values: true,
                multi_link_display_option: MultiLinkDisplayOption.tag,
                type: AttributeType.advanced_link
            };

            render(<TableCell values={linkValues} attributeProperties={attributeProperties} />);

            linkValues.forEach(value => {
                expect(screen.getByText(value.linkPayload?.whoAmI.label as string)).toBeVisible();
            });
            screen.getAllByText(`+${linkValues.length} Autres`).forEach(element => {
                expect(element).toBeVisible();
            });
        });
    });
});
