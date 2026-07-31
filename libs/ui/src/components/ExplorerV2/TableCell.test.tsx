import {render, screen} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import {
    type AttributePropertiesFragment,
    AttributeType,
    MultiDisplayOption,
    type PropertyValueLinkValueFragment,
    type PropertyValueTreeValueFragment,
} from '_ui/_gqlTypes';
import {TableCell} from './TableCell';

describe('TableCell component', () => {
    describe('Attribute with single value', () => {
        describe('For link attribute', () => {
            const linkValue: PropertyValueLinkValueFragment[] = [
                {
                    linkPayload: {
                        id: 'singlevalRecord1',
                        whoAmI: {...mockRecord, label: 'Record A', subLabel: 'Sub Label A'},
                    },
                },
            ];

            test('Should display IdCard', async () => {
                const attributeProperties: AttributePropertiesFragment = {
                    id: 'default',
                    type: AttributeType.advanced_link,
                    multiple_values: false,
                };

                render(<TableCell values={linkValue} attributeProperties={attributeProperties} />);

                expect(screen.getByRole('img')).toHaveAttribute('src', mockRecord.preview?.small);
                expect(screen.getByText('Record A')).toBeVisible();
                expect(screen.getByText('Sub Label A')).toBeVisible();
            });

            test('Should display a tag when the display option is tag', async () => {
                const attributeProperties: AttributePropertiesFragment = {
                    id: 'default',
                    type: AttributeType.advanced_link,
                    multiple_values: false,
                    multi_link_display_option: MultiDisplayOption.tag,
                };

                render(<TableCell values={linkValue} attributeProperties={attributeProperties} />);

                expect(screen.getAllByText('Record A')[0]).toBeVisible();
                expect(screen.queryByRole('img')).not.toBeInTheDocument();
                expect(screen.queryByText('Sub Label A')).not.toBeInTheDocument();
            });

            test.each([
                ['avatar', MultiDisplayOption.avatar],
                ['badge_qty', MultiDisplayOption.badge_qty],
                ['omitted', undefined],
            ])('Should display IdCard when the display option is %s', async (_, multiLinkDisplayOption) => {
                const attributeProperties: AttributePropertiesFragment = {
                    id: 'default',
                    type: AttributeType.advanced_link,
                    multiple_values: false,
                    multi_link_display_option: multiLinkDisplayOption,
                };

                render(<TableCell values={linkValue} attributeProperties={attributeProperties} />);

                expect(screen.getByRole('img')).toHaveAttribute('src', mockRecord.preview?.small);
                expect(screen.getByText('Record A')).toBeVisible();
            });
        });

        describe('For tree attribute', () => {
            const treeValue: PropertyValueTreeValueFragment[] = [
                {
                    treePayload: {
                        record: {...mockRecord, whoAmI: {...mockRecord, label: 'Record A', subLabel: 'Sub Label A'}},
                    },
                },
            ];

            test('Should display IdCard', async () => {
                const attributeProperties: AttributePropertiesFragment = {
                    id: 'default',
                    type: AttributeType.tree,
                    multiple_values: false,
                };

                render(<TableCell values={treeValue} attributeProperties={attributeProperties} />);

                expect(screen.getByRole('img')).toHaveAttribute('src', mockRecord.preview?.small);
                expect(screen.getByText('Record A')).toBeVisible();
                expect(screen.getByText('Sub Label A')).toBeVisible();
            });

            test('Should display a tag when the display option is tag', async () => {
                const attributeProperties: AttributePropertiesFragment = {
                    id: 'default',
                    type: AttributeType.tree,
                    multiple_values: false,
                    multi_tree_display_option: MultiDisplayOption.tag,
                };

                render(<TableCell values={treeValue} attributeProperties={attributeProperties} />);

                expect(screen.getAllByText('Record A')[0]).toBeVisible();
                expect(screen.queryByRole('img')).not.toBeInTheDocument();
                expect(screen.queryByText('Sub Label A')).not.toBeInTheDocument();
            });

            test.each([
                ['avatar', MultiDisplayOption.avatar],
                ['badge_qty', MultiDisplayOption.badge_qty],
                ['omitted', undefined],
            ])('Should display IdCard when the display option is %s', async (_, multiTreeDisplayOption) => {
                const attributeProperties: AttributePropertiesFragment = {
                    id: 'default',
                    type: AttributeType.tree,
                    multiple_values: false,
                    multi_tree_display_option: multiTreeDisplayOption,
                };

                render(<TableCell values={treeValue} attributeProperties={attributeProperties} />);

                expect(screen.getByRole('img')).toHaveAttribute('src', mockRecord.preview?.small);
                expect(screen.getByText('Record A')).toBeVisible();
            });
        });
    });
    describe('Attribute with multiple values', () => {
        describe('For link attribute', () => {
            const linkValues: PropertyValueLinkValueFragment[] = [
                {
                    linkPayload: {
                        id: 'multivalRecord1',
                        whoAmI: {...mockRecord, preview: null, label: 'Record A'},
                    },
                },
                {
                    linkPayload: {
                        id: 'multivalRecord2',
                        whoAmI: {...mockRecord, preview: null, label: 'Record B'},
                    },
                },
                {
                    linkPayload: {
                        id: 'multivalRecord3',
                        whoAmI: {...mockRecord, preview: null, label: 'Record C'},
                    },
                },
                {
                    linkPayload: {
                        id: 'multivalRecord4',
                        whoAmI: {...mockRecord, preview: null, label: 'Record D'},
                    },
                },
                {
                    linkPayload: {id: 'multivalRecord5', whoAmI: {...mockRecord, label: 'Record E'}},
                },
                {
                    linkPayload: {id: 'multivalRecord6', whoAmI: {...mockRecord, label: 'Record F'}},
                },
                {
                    linkPayload: {id: 'multivalRecord7', whoAmI: {...mockRecord, label: 'Record G'}},
                },
            ];

            test('Should display list of avatar as default', async () => {
                const attributeProperties: AttributePropertiesFragment = {
                    id: 'default',
                    multiple_values: true,
                    multi_link_display_option: MultiDisplayOption.avatar,
                    type: AttributeType.advanced_link,
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
                    multi_link_display_option: MultiDisplayOption.badge_qty,
                    type: AttributeType.advanced_link,
                };

                render(<TableCell values={linkValues} attributeProperties={attributeProperties} />);

                expect(screen.getByText(linkValues.length)).toBeVisible();
            });

            test('Should display list of tag', async () => {
                const attributeProperties: AttributePropertiesFragment = {
                    id: 'default',
                    multiple_values: true,
                    multi_link_display_option: MultiDisplayOption.tag,
                    type: AttributeType.advanced_link,
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

        describe('For tree attribute', () => {
            const treeValues: PropertyValueTreeValueFragment[] = [
                {
                    treePayload: {
                        record: {...mockRecord, whoAmI: {...mockRecord, preview: null, label: 'Record A'}},
                    },
                },
                {
                    treePayload: {
                        record: {...mockRecord, whoAmI: {...mockRecord, preview: null, label: 'Record B'}},
                    },
                },
                {
                    treePayload: {
                        record: {...mockRecord, whoAmI: {...mockRecord, preview: null, label: 'Record C'}},
                    },
                },
                {
                    treePayload: {
                        record: {...mockRecord, whoAmI: {...mockRecord, preview: null, label: 'Record D'}},
                    },
                },
                {
                    treePayload: {
                        record: {...mockRecord, whoAmI: {...mockRecord, label: 'Record E'}},
                    },
                },
                {
                    treePayload: {
                        record: {...mockRecord, whoAmI: {...mockRecord, label: 'Record F'}},
                    },
                },
                {
                    treePayload: {
                        record: {...mockRecord, whoAmI: {...mockRecord, label: 'Record G'}},
                    },
                },
            ];

            test('Should display list of avatar as default', async () => {
                const attributeProperties: AttributePropertiesFragment = {
                    id: 'default',
                    multiple_values: true,
                    multi_tree_display_option: MultiDisplayOption.avatar,
                    type: AttributeType.tree,
                };

                render(<TableCell values={treeValues} attributeProperties={attributeProperties} />);

                expect(screen.getByText('RA')).toBeVisible();
                expect(screen.getByText('RB')).toBeVisible();
                expect(screen.getByText('RC')).toBeVisible();
                expect(screen.getByText('RD')).toBeVisible();
                expect(screen.getByRole('img')).toHaveAttribute('src', mockRecord.preview?.small);
                expect(screen.getByText('+2')).toBeVisible();
            });

            test('Should display only quantity of trees', async () => {
                const attributeProperties: AttributePropertiesFragment = {
                    id: 'default',
                    multiple_values: true,
                    multi_tree_display_option: MultiDisplayOption.badge_qty,
                    type: AttributeType.tree,
                };

                render(<TableCell values={treeValues} attributeProperties={attributeProperties} />);

                expect(screen.getByText(treeValues.length)).toBeVisible();
            });

            test('Should display list of tag', async () => {
                const attributeProperties: AttributePropertiesFragment = {
                    id: 'default',
                    multiple_values: true,
                    multi_tree_display_option: MultiDisplayOption.tag,
                    type: AttributeType.tree,
                };

                render(<TableCell values={treeValues} attributeProperties={attributeProperties} />);

                treeValues.forEach(value => {
                    expect(screen.getByText(value.treePayload?.record.whoAmI.label as string)).toBeVisible();
                });
                screen.getAllByText(`+${treeValues.length} Autres`).forEach(element => {
                    expect(element).toBeVisible();
                });
            });
        });

        describe('Tag color from identity card (LEAVC-876)', () => {
            const _getTagRoot = (label: string) => screen.getByText(label).closest('.ant-tag');

            test('For link attribute, colors the tag and contrasts the text with the identity card color', async () => {
                const linkValues: PropertyValueLinkValueFragment[] = [
                    // Light background → dark text for readability
                    {linkPayload: {id: 'r1', whoAmI: {...mockRecord, label: 'Light', color: '#f8e58c'}}},
                    // Dark background → white text
                    {linkPayload: {id: 'r2', whoAmI: {...mockRecord, label: 'Dark', color: '#000080'}}},
                    // No color → default primary (blue) tag, white text
                    {linkPayload: {id: 'r3', whoAmI: {...mockRecord, label: 'Default', color: null}}},
                ];
                const attributeProperties: AttributePropertiesFragment = {
                    id: 'default',
                    multiple_values: true,
                    multi_link_display_option: MultiDisplayOption.tag,
                    type: AttributeType.advanced_link,
                };

                render(<TableCell values={linkValues} attributeProperties={attributeProperties} />);

                expect(_getTagRoot('Light')).toHaveStyle({backgroundColor: '#f8e58c'});
                expect(_getTagRoot('Light')).not.toHaveClass('kit-tag-primary');
                // Read the literal custom property from the inline style: happy-dom's
                // getComputedStyle (used by toHaveStyle) resolves var() to its computed value.
                expect(screen.getByText('Light').style.getPropertyValue('--kit-typography-color')).toBe(
                    'var(--general-colors-neutral-black)',
                );

                expect(_getTagRoot('Dark')).toHaveStyle({backgroundColor: '#000080'});
                expect(screen.getByText('Dark').style.getPropertyValue('--kit-typography-color')).toBe(
                    'var(--general-colors-neutral-white)',
                );

                expect(_getTagRoot('Default')).toHaveClass('kit-tag-primary');
                expect(screen.getByText('Default').style.getPropertyValue('--kit-typography-color')).toBe(
                    'var(--general-colors-neutral-white)',
                );
            });

            test('For tree attribute, colors the tag and contrasts the text with the identity card color', async () => {
                const treeValues: PropertyValueTreeValueFragment[] = [
                    {treePayload: {record: {...mockRecord, whoAmI: {...mockRecord, label: 'Light', color: '#f8e58c'}}}},
                    {treePayload: {record: {...mockRecord, whoAmI: {...mockRecord, label: 'Dark', color: '#000080'}}}},
                    {treePayload: {record: {...mockRecord, whoAmI: {...mockRecord, label: 'Default', color: null}}}},
                ];
                const attributeProperties: AttributePropertiesFragment = {
                    id: 'default',
                    multiple_values: true,
                    multi_tree_display_option: MultiDisplayOption.tag,
                    type: AttributeType.tree,
                };

                render(<TableCell values={treeValues} attributeProperties={attributeProperties} />);

                expect(_getTagRoot('Light')).toHaveStyle({backgroundColor: '#f8e58c'});
                expect(_getTagRoot('Light')).not.toHaveClass('kit-tag-primary');
                // Read the literal custom property from the inline style: happy-dom's
                // getComputedStyle (used by toHaveStyle) resolves var() to its computed value.
                expect(screen.getByText('Light').style.getPropertyValue('--kit-typography-color')).toBe(
                    'var(--general-colors-neutral-black)',
                );

                expect(_getTagRoot('Dark')).toHaveStyle({backgroundColor: '#000080'});
                expect(screen.getByText('Dark').style.getPropertyValue('--kit-typography-color')).toBe(
                    'var(--general-colors-neutral-white)',
                );

                expect(_getTagRoot('Default')).toHaveClass('kit-tag-primary');
                expect(screen.getByText('Default').style.getPropertyValue('--kit-typography-color')).toBe(
                    'var(--general-colors-neutral-white)',
                );
            });

            test('For a mono-valued link attribute, colors the tag with the identity card color', async () => {
                const linkValue: PropertyValueLinkValueFragment[] = [
                    {linkPayload: {id: 'r1', whoAmI: {...mockRecord, label: 'Light', color: '#f8e58c'}}},
                ];
                const attributeProperties: AttributePropertiesFragment = {
                    id: 'default',
                    multiple_values: false,
                    multi_link_display_option: MultiDisplayOption.tag,
                    type: AttributeType.advanced_link,
                };

                render(<TableCell values={linkValue} attributeProperties={attributeProperties} />);

                // happy-dom leaves KitTag.Group's hidden measure block in the DOM (LEAVC-875 known
                // pitfall), hence getAllByText rather than getByText even for a single tag.
                expect(screen.getAllByText('Light')[0].closest('.ant-tag')).toHaveStyle({
                    backgroundColor: '#f8e58c',
                });
            });

            test('For a mono-valued tree attribute, colors the tag with the identity card color', async () => {
                const treeValue: PropertyValueTreeValueFragment[] = [
                    {treePayload: {record: {...mockRecord, whoAmI: {...mockRecord, label: 'Light', color: '#f8e58c'}}}},
                ];
                const attributeProperties: AttributePropertiesFragment = {
                    id: 'default',
                    multiple_values: false,
                    multi_tree_display_option: MultiDisplayOption.tag,
                    type: AttributeType.tree,
                };

                render(<TableCell values={treeValue} attributeProperties={attributeProperties} />);

                expect(screen.getAllByText('Light')[0].closest('.ant-tag')).toHaveStyle({
                    backgroundColor: '#f8e58c',
                });
            });
        });
    });
});
