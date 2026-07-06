import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type IRecordDomain} from '../record/recordDomain';
import {type ToAny, type IUtils} from '../../utils/utils';
import {type IQueryInfos} from '../../_types/queryInfos';
import exportDomain, {type IExportDomainDeps} from './exportDomain';
import {AttributeFormats} from '../../_types/attribute';
import {when} from 'jest-when';

const depsBase: ToAny<IExportDomainDeps> = {
    'core.domain.record': vi.fn(),
    'core.domain.attribute': vi.fn(),
    'core.domain.library': vi.fn(),
    'core.domain.tasksManager': vi.fn(),
    'core.domain.helpers.validate': vi.fn(),
    'core.domain.export.exportProfile': vi.fn(),
    'core.domain.helpers.updateTaskProgress': vi.fn(),
    'core.domain.eventsManager': vi.fn(),
    'core.domain.notification': vi.fn(),
    'core.utils': vi.fn(),
    translator: {},
    config: {},
};

describe('exportDomain', () => {
    const mockCtx: IQueryInfos = {
        userId: '1',
        queryId: 'exportDomainTest',
    };

    describe('Export data', () => {
        it('should export data with different attributes types', async () => {
            const mapping = {
                simple: {attribute: 'bikes.bikes_label'},
                link: {attribute: 'bikes.bikes_activity.activities_label'},
                preview: {attribute: 'bikes.bikes_visual.files_previews.medium'},
                no_value: {attribute: 'bikes.no_value'},
                shop_label: {attribute: 'shops.shops_label'},
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: vi.fn(),
            };

            const mockUtils: Mockify<IUtils> = {
                isLinkAttribute: vi.fn(),
            };

            const attributeProperties = {
                bikes_label: {format: AttributeFormats.TEXT},
                bikes_activity: {linked_library: 'activities'},
                activities_label: {format: AttributeFormats.TEXT},
                bikes_visual: {linked_library: 'files'},
                files_previews: {format: AttributeFormats.EXTENDED},
                no_value: {format: AttributeFormats.TEXT, linked_library: false},
                shops_label: {format: AttributeFormats.TEXT},
            };

            when(mockUtils.isLinkAttribute)
                .calledWith({id: 'bikes_visual', ...attributeProperties.bikes_visual})
                .mockReturnValue(true);
            when(mockUtils.isLinkAttribute)
                .calledWith({id: 'bikes_activity', ...attributeProperties.bikes_activity})
                .mockReturnValue(true);

            Object.entries(attributeProperties).forEach(([id, returnValue]) =>
                when(mockAttributeDomain.getAttributeProperties)
                    .calledWith({id, ctx: mockCtx})
                    .mockReturnValue({id, ...returnValue}),
            );

            const mockRecordDomain: Mockify<IRecordDomain> = {
                getRecordFieldValue: vi.fn(),
            };

            const fieldValues = [
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributePath: 'bikes_label',
                    returnValue: [{payload: 'bikeLabel'}],
                },
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributePath: 'bikes_activity.activities_label',
                    returnValue: [{payload: 'activityLabel'}],
                },
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributePath: 'bikes_visual.files_previews.medium',
                    returnValue: [{payload: '/path/to/preview'}],
                },
                {library: 'bikes', recordId: 'bikeId', attributePath: 'no_value', returnValue: []},
                {
                    library: 'shops',
                    recordId: 'shopId',
                    attributePath: 'shops_label',
                    returnValue: [{payload: 'shopLabel'}],
                },
            ];

            fieldValues.forEach(({library, recordId, attributePath, returnValue}) =>
                when(mockRecordDomain.getRecordFieldValue)
                    .calledWith({library, record: {id: recordId}, attributePath, ctx: mockCtx})
                    .mockReturnValue(returnValue),
            );

            const domain = exportDomain({
                ...depsBase,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.utils': mockUtils as IUtils,
            });

            const data = await domain.exportData(mapping, [{bikes: 'bikeId', shops: 'shopId'}], mockCtx);

            expect(data).toEqual([
                {
                    link: 'activityLabel',
                    no_value: '',
                    preview: '/path/to/preview',
                    simple: 'bikeLabel',
                    shop_label: 'shopLabel',
                },
            ]);
        });

        it('should export data with a structure based on dot notation keys', async () => {
            const mapping = {
                simple: {attribute: 'bikes.bikes_label'},
                'link.link': {attribute: 'bikes.bikes_activity.activities_label'},
                'link.preview': {attribute: 'bikes.bikes_visual.files_previews.medium'},
                'no_value.no_value.no_value': {attribute: 'bikes.no_value'},
                shop_label: {attribute: 'shops.shops_label'},
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: vi.fn(),
            };

            const mockUtils: Mockify<IUtils> = {
                isLinkAttribute: vi.fn(),
            };

            const attributeProperties = {
                bikes_label: {format: AttributeFormats.TEXT},
                bikes_activity: {linked_library: 'activities'},
                activities_label: {format: AttributeFormats.TEXT},
                bikes_visual: {linked_library: 'files'},
                files_previews: {format: AttributeFormats.EXTENDED},
                no_value: {format: AttributeFormats.TEXT, linked_library: false},
                shops_label: {format: AttributeFormats.TEXT},
            };

            when(mockUtils.isLinkAttribute)
                .calledWith({id: 'bikes_visual', ...attributeProperties.bikes_visual})
                .mockReturnValue(true);
            when(mockUtils.isLinkAttribute)
                .calledWith({id: 'bikes_activity', ...attributeProperties.bikes_activity})
                .mockReturnValue(true);

            Object.entries(attributeProperties).forEach(([id, returnValue]) =>
                when(mockAttributeDomain.getAttributeProperties)
                    .calledWith({id, ctx: mockCtx})
                    .mockReturnValue({id, ...returnValue}),
            );

            const mockRecordDomain: Mockify<IRecordDomain> = {
                getRecordFieldValue: vi.fn(),
            };

            const fieldValues = [
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributePath: 'bikes_label',
                    returnValue: [{payload: 'bikeLabel'}],
                },
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributePath: 'bikes_activity.activities_label',
                    returnValue: [{payload: 'activityLabel'}],
                },
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributePath: 'bikes_visual.files_previews.medium',
                    returnValue: [{payload: '/path/to/preview'}],
                },
                {library: 'bikes', recordId: 'bikeId', attributePath: 'no_value', returnValue: []},
                {
                    library: 'shops',
                    recordId: 'shopId',
                    attributePath: 'shops_label',
                    returnValue: [{payload: 'shopLabel'}],
                },
            ];

            fieldValues.forEach(({library, recordId, attributePath, returnValue}) =>
                when(mockRecordDomain.getRecordFieldValue)
                    .calledWith({library, record: {id: recordId}, attributePath, ctx: mockCtx})
                    .mockReturnValue(returnValue),
            );

            const domain = exportDomain({
                ...depsBase,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.utils': mockUtils as IUtils,
            });

            const data = await domain.exportData(mapping, [{bikes: 'bikeId', shops: 'shopId'}], mockCtx);

            expect(data).toEqual([
                {
                    link: {
                        link: 'activityLabel',
                        preview: '/path/to/preview',
                    },
                    no_value: {no_value: {no_value: ''}},
                    simple: 'bikeLabel',
                    shop_label: 'shopLabel',
                },
            ]);
        });

        it('should export data with multiple values', async () => {
            const mapping = {
                multivalues_links: {attribute: 'bikes.bikes_shops.shops_label'},
                multivalues: {attribute: 'bikes.bikes_sizes'},
                no_values: {attribute: 'bikes.bikes_colors'},
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: vi.fn(),
            };

            const mockUtils: Mockify<IUtils> = {
                isLinkAttribute: vi.fn(),
            };

            const attributeProperties = {
                bikes_shops: {linked_library: 'shops'},
                shops_label: {format: AttributeFormats.TEXT, multiple_values: true},
                bikes_sizes: {format: AttributeFormats.TEXT, multiple_values: true},
                bikes_colors: {format: AttributeFormats.TEXT, multiple_values: true},
            };

            when(mockUtils.isLinkAttribute)
                .calledWith({id: 'bikes_shops', ...attributeProperties.bikes_shops})
                .mockReturnValue(true);

            Object.entries(attributeProperties).forEach(([id, returnValue]) =>
                when(mockAttributeDomain.getAttributeProperties)
                    .calledWith({id, ctx: mockCtx})
                    .mockReturnValue({id, ...returnValue}),
            );

            const mockRecordDomain: Mockify<IRecordDomain> = {
                getRecordFieldValue: vi.fn(),
            };

            const fieldValues = [
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributePath: 'bikes_sizes',
                    returnValue: [{payload: 'S'}, {payload: 'M'}, {payload: 'L'}, {payload: 'XL'}],
                },
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributePath: 'bikes_shops.shops_label',
                    returnValue: [{payload: 'shopLabel'}, {payload: 'shopLabel2'}],
                },
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributePath: 'bikes_colors',
                    returnValue: [],
                },
            ];

            fieldValues.forEach(({library, recordId, attributePath, returnValue}) =>
                when(mockRecordDomain.getRecordFieldValue)
                    .calledWith({library, record: {id: recordId}, attributePath, ctx: mockCtx})
                    .mockReturnValue(returnValue),
            );

            const domain = exportDomain({
                ...depsBase,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.utils': mockUtils as IUtils,
            });

            const data = await domain.exportData(mapping, [{bikes: 'bikeId'}], mockCtx);

            expect(data).toEqual([
                {
                    multivalues_links: 'shopLabel,shopLabel2',
                    multivalues: 'S,M,L,XL',
                    no_values: '',
                },
            ]);
        });

        it('should export data with raw values', async () => {
            const mapping = {
                raw_link_multivalues: {attribute: 'bikes.bikes_shops.shops_label', rawValue: true},
                raw_multivalues: {attribute: 'bikes.bikes_sizes', rawValue: true},
                raw_value: {attribute: 'bikes.bikes_color', rawValue: true},
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: vi.fn(),
            };

            const mockUtils: Mockify<IUtils> = {
                isLinkAttribute: vi.fn(),
            };

            const attributeProperties = {
                bikes_shops: {linked_library: 'shops'},
                shops_label: {format: AttributeFormats.TEXT, multiple_values: true},
                bikes_sizes: {format: AttributeFormats.TEXT, multiple_values: true},
                bikes_color: {format: AttributeFormats.TEXT, multiple_values: false},
            };

            when(mockUtils.isLinkAttribute)
                .calledWith({id: 'bikes_shops', ...attributeProperties.bikes_shops})
                .mockReturnValue(true);

            Object.entries(attributeProperties).forEach(([id, returnValue]) =>
                when(mockAttributeDomain.getAttributeProperties)
                    .calledWith({id, ctx: mockCtx})
                    .mockReturnValue({id, ...returnValue}),
            );

            const mockRecordDomain: Mockify<IRecordDomain> = {
                getRecordFieldValue: vi.fn(),
            };

            const fieldValues = [
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributePath: 'bikes_sizes',
                    returnValue: [
                        {payload: 'Size S', raw_payload: 'S'},
                        {payload: 'Size M', raw_payload: 'M'},
                        {payload: 'Size L', raw_payload: 'L'},
                        {payload: 'Size XL', raw_payload: 'XL'},
                    ],
                },
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributePath: 'bikes_shops.shops_label',
                    returnValue: [
                        {payload: 'Welcome to shopLabel', raw_payload: 'shopLabel'},
                        {payload: 'Welcome to shopLabel2', raw_payload: 'shopLabel2'},
                    ],
                },
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributePath: 'bikes_color',
                    returnValue: [{payload: 'Color: blue', raw_payload: 'blue'}],
                },
            ];

            fieldValues.forEach(({library, recordId, attributePath, returnValue}) =>
                when(mockRecordDomain.getRecordFieldValue)
                    .calledWith({library, record: {id: recordId}, attributePath, ctx: mockCtx})
                    .mockReturnValue(returnValue),
            );

            const domain = exportDomain({
                ...depsBase,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.utils': mockUtils as IUtils,
            });

            const data = await domain.exportData(mapping, [{bikes: 'bikeId'}], mockCtx);

            expect(data).toEqual([
                {
                    raw_link_multivalues: 'shopLabel,shopLabel2',
                    raw_multivalues: 'S,M,L,XL',
                    raw_value: 'blue',
                },
            ]);
        });

        it('should format a date_range payload as "from - to" based on the attribute format, not the payload shape', async () => {
            const mapping = {
                validity: {attribute: 'bikes.validity_period'},
                extended_from_to: {attribute: 'bikes.custom_fields'},
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: vi.fn(),
            };

            const attributeProperties = {
                validity_period: {format: AttributeFormats.DATE_RANGE},
                // An extended attribute whose resolved payload happens to contain from/to keys unrelated
                // to a date range - it must NOT be formatted as "from - to".
                custom_fields: {format: AttributeFormats.EXTENDED},
            };

            Object.entries(attributeProperties).forEach(([id, returnValue]) =>
                when(mockAttributeDomain.getAttributeProperties)
                    .calledWith({id, ctx: mockCtx})
                    .mockReturnValue({id, ...returnValue}),
            );

            const mockRecordDomain: Mockify<IRecordDomain> = {
                getRecordFieldValue: vi.fn(),
            };

            const fieldValues = [
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributePath: 'validity_period',
                    returnValue: [{payload: {from: '2024-01-01', to: '2024-12-31'}, attribute: 'validity_period'}],
                },
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributePath: 'custom_fields',
                    returnValue: [{payload: {from: 'Paris', to: 'Lyon'}, attribute: 'custom_fields'}],
                },
            ];

            fieldValues.forEach(({library, recordId, attributePath, returnValue}) =>
                when(mockRecordDomain.getRecordFieldValue)
                    .calledWith({library, record: {id: recordId}, attributePath, ctx: mockCtx})
                    .mockReturnValue(returnValue),
            );

            const domain = exportDomain({
                ...depsBase,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
            });

            const data = await domain.exportData(mapping, [{bikes: 'bikeId'}], mockCtx);

            expect(data).toEqual([
                {
                    validity: '2024-01-01 - 2024-12-31',
                    // Not a date_range attribute, so no "from - to" formatting is applied
                    extended_from_to: '[object Object]',
                },
            ]);
        });
    });

    describe('exportExcel', () => {
        it('should throw CustomConfigError when profile returns no attributes', async () => {
            const mockExportProfileDomain = {
                getColumnsFromProfileConfig: vi.fn().mockResolvedValue(undefined),
            };

            const domain = exportDomain({
                ...depsBase,
                'core.domain.export.exportProfile': mockExportProfileDomain as any,
            });

            const library = 'test_library';

            await expect(
                domain.exportExcel({
                    library,
                    profile: 'invalid_profile',
                    ctx: mockCtx,
                }),
            ).rejects.toThrow('No attributes provided for exportExcel function for library test_library');

            expect(mockExportProfileDomain.getColumnsFromProfileConfig).toHaveBeenCalledWith(
                'invalid_profile',
                'test_library',
                mockCtx,
            );
        });

        it('should create a task and return task ID when no task.id is provided', async () => {
            const mockTasksManager = {
                createTask: vi.fn().mockResolvedValue(undefined),
            };

            const mockExportProfileDomain = {
                getColumnsFromProfileConfig: vi.fn().mockResolvedValue([
                    {columnLabel: 'Name', attribute: 'name'},
                    {columnLabel: 'Email', attribute: 'email'},
                ]),
            };

            const domain = exportDomain({
                ...depsBase,
                'core.domain.tasksManager': mockTasksManager as any,
                'core.domain.export.exportProfile': mockExportProfileDomain as any,
                config: {
                    lang: {
                        available: ['en', 'fr'],
                        default: 'en',
                    },
                } as any,
                translator: {
                    t: vi.fn().mockReturnValue('Export task'),
                } as any,
            });

            const result = await domain.exportExcel({
                library: 'test_library',
                profile: 'test_profile',
                ctx: mockCtx,
            });

            // Should return a task ID (UUID format)
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
            expect(mockExportProfileDomain.getColumnsFromProfileConfig).toHaveBeenCalledWith(
                'test_profile',
                'test_library',
                mockCtx,
            );
            expect(mockTasksManager.createTask).toHaveBeenCalled();
        });

        it('should extract attributes and columnLabels from profile correctly', async () => {
            const mockColumns = [
                {columnLabel: 'Name Column', attribute: 'name'},
                {columnLabel: 'Email Column', attribute: 'email'},
                {columnLabel: 'Phone Column', attribute: 'phone'},
            ];

            const mockExportProfileDomain = {
                getColumnsFromProfileConfig: vi.fn().mockResolvedValue(mockColumns),
            };

            const mockTasksManager = {
                createTask: vi.fn().mockResolvedValue(undefined),
            };

            const domain = exportDomain({
                ...depsBase,
                'core.domain.export.exportProfile': mockExportProfileDomain as any,
                'core.domain.tasksManager': mockTasksManager as any,
                config: {
                    lang: {
                        available: ['en'],
                        default: 'en',
                    },
                } as any,
                translator: {
                    t: vi.fn().mockReturnValue('Export task'),
                } as any,
            });

            const result = await domain.exportExcel({
                library: 'test_library',
                profile: 'test_profile',
                ctx: mockCtx,
            });

            expect(typeof result).toBe('string');
            expect(mockExportProfileDomain.getColumnsFromProfileConfig).toHaveBeenCalledWith(
                'test_profile',
                'test_library',
                mockCtx,
            );

            // Verify createTask was called with correct attributes extracted from columns
            expect(mockTasksManager.createTask).toHaveBeenCalledWith(
                expect.objectContaining({
                    func: expect.objectContaining({
                        args: expect.objectContaining({
                            library: 'test_library',
                            profile: 'test_profile',
                        }),
                    }),
                }),
                mockCtx,
            );
        });
    });
});
