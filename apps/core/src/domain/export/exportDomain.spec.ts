// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ToAny, IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import exportDomain, {IExportDomainDeps} from './exportDomain';
import {AttributeFormats} from '../../_types/attribute';
import {when} from 'jest-when';

const depsBase: ToAny<IExportDomainDeps> = {
    'core.domain.record': jest.fn(),
    'core.domain.attribute': jest.fn(),
    'core.domain.library': jest.fn(),
    'core.domain.tasksManager': jest.fn(),
    'core.domain.helpers.validate': jest.fn(),
    'core.domain.helpers.updateTaskProgress': jest.fn(),
    'core.domain.eventsManager': jest.fn(),
    'core.utils': jest.fn(),
    translator: {},
    config: {}
};

describe('exportDomain', () => {
    const mockCtx: IQueryInfos = {
        userId: '1',
        queryId: 'exportDomainTest'
    };

    describe('Export data', () => {
        it('should export data with different attributes types', async () => {
            const jsonMapping = JSON.stringify({
                simple: 'bikes.bikes_label',
                link: 'bikes.bikes_activity.activities_label',
                preview: 'bikes.bikes_visual.files_previews.medium',
                no_value: 'bikes.no_value',
                shop_label: 'shops.shops_label'
            });

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: jest.fn()
            };

            const mockUtils: Mockify<IUtils> = {
                isLinkAttribute: jest.fn()
            };

            const attributeProperties = {
                bikes_label: {format: AttributeFormats.TEXT},
                bikes_activity: {linked_library: 'activities'},
                activities_label: {format: AttributeFormats.TEXT},
                bikes_visual: {linked_library: 'files'},
                files_previews: {format: AttributeFormats.EXTENDED},
                no_value: {format: AttributeFormats.TEXT, linked_library: false},
                shops_label: {format: AttributeFormats.TEXT}
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
                    .mockReturnValue({id, ...returnValue})
            );

            const mockRecordDomain: Mockify<IRecordDomain> = {
                getRecordFieldValue: jest.fn()
            };

            const fieldValues = [
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributeId: 'bikes_label',
                    returnValue: [{payload: 'bikeLabel'}]
                },
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributeId: 'bikes_activity',
                    returnValue: [{payload: {id: 'activityId'}}]
                },
                {
                    library: 'activities',
                    recordId: 'activityId',
                    attributeId: 'activities_label',
                    returnValue: [{payload: 'activityLabel'}]
                },
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributeId: 'bikes_visual',
                    returnValue: [{payload: {id: 'fileId'}}]
                },
                {
                    library: 'files',
                    recordId: 'fileId',
                    attributeId: 'files_previews',
                    returnValue: [{payload: JSON.stringify({medium: '/path/to/preview'})}]
                },
                {library: 'bikes', recordId: 'bikeId', attributeId: 'no_value', returnValue: []},
                {
                    library: 'shops',
                    recordId: 'shopId',
                    attributeId: 'shops_label',
                    returnValue: [{payload: 'shopLabel'}]
                }
            ];

            fieldValues.forEach(({library, recordId, attributeId, returnValue}) =>
                when(mockRecordDomain.getRecordFieldValue)
                    .calledWith({library, record: {id: recordId}, attributeId, ctx: mockCtx})
                    .mockReturnValue(returnValue)
            );

            const domain = exportDomain({
                ...depsBase,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.utils': mockUtils as IUtils
            });

            const data = await domain.exportData(jsonMapping, [{bikes: 'bikeId', shops: 'shopId'}], mockCtx);

            expect(data).toEqual([
                {
                    link: 'activityLabel',
                    no_value: '',
                    preview: '/path/to/preview',
                    simple: 'bikeLabel',
                    shop_label: 'shopLabel'
                }
            ]);
        });

        it('should export data with a structure based on dot notation keys', async () => {
            const jsonMapping = JSON.stringify({
                simple: 'bikes.bikes_label',
                'link.link': 'bikes.bikes_activity.activities_label',
                'link.preview': 'bikes.bikes_visual.files_previews.medium',
                'no_value.no_value.no_value': 'bikes.no_value',
                shop_label: 'shops.shops_label'
            });

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: jest.fn()
            };

            const mockUtils: Mockify<IUtils> = {
                isLinkAttribute: jest.fn()
            };

            const attributeProperties = {
                bikes_label: {format: AttributeFormats.TEXT},
                bikes_activity: {linked_library: 'activities'},
                activities_label: {format: AttributeFormats.TEXT},
                bikes_visual: {linked_library: 'files'},
                files_previews: {format: AttributeFormats.EXTENDED},
                no_value: {format: AttributeFormats.TEXT, linked_library: false},
                shops_label: {format: AttributeFormats.TEXT}
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
                    .mockReturnValue({id, ...returnValue})
            );

            const mockRecordDomain: Mockify<IRecordDomain> = {
                getRecordFieldValue: jest.fn()
            };

            const fieldValues = [
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributeId: 'bikes_label',
                    returnValue: [{payload: 'bikeLabel'}]
                },
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributeId: 'bikes_activity',
                    returnValue: [{payload: {id: 'activityId'}}]
                },
                {
                    library: 'activities',
                    recordId: 'activityId',
                    attributeId: 'activities_label',
                    returnValue: [{payload: 'activityLabel'}]
                },
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributeId: 'bikes_visual',
                    returnValue: [{payload: {id: 'fileId'}}]
                },
                {
                    library: 'files',
                    recordId: 'fileId',
                    attributeId: 'files_previews',
                    returnValue: [{payload: JSON.stringify({medium: '/path/to/preview'})}]
                },
                {library: 'bikes', recordId: 'bikeId', attributeId: 'no_value', returnValue: []},
                {
                    library: 'shops',
                    recordId: 'shopId',
                    attributeId: 'shops_label',
                    returnValue: [{payload: 'shopLabel'}]
                }
            ];

            fieldValues.forEach(({library, recordId, attributeId, returnValue}) =>
                when(mockRecordDomain.getRecordFieldValue)
                    .calledWith({library, record: {id: recordId}, attributeId, ctx: mockCtx})
                    .mockReturnValue(returnValue)
            );

            const domain = exportDomain({
                ...depsBase,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.utils': mockUtils as IUtils
            });

            const data = await domain.exportData(jsonMapping, [{bikes: 'bikeId', shops: 'shopId'}], mockCtx);

            expect(data).toEqual([
                {
                    link: {
                        link: 'activityLabel',
                        preview: '/path/to/preview'
                    },
                    no_value: {no_value: {no_value: ''}},
                    simple: 'bikeLabel',
                    shop_label: 'shopLabel'
                }
            ]);
        });

        it('should export data with multiple values', async () => {
            const jsonMapping = JSON.stringify({
                multivalues_links: 'bikes.bikes_shops.shops_label',
                multivalues: 'bikes.bikes_sizes',
                no_values: 'bikes.colors_label'
            });

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: jest.fn()
            };

            const mockUtils: Mockify<IUtils> = {
                isLinkAttribute: jest.fn()
            };

            const attributeProperties = {
                bikes_shops: {linked_library: 'shops'},
                shops_label: {format: AttributeFormats.TEXT, multiple_values: true},
                bikes_sizes: {format: AttributeFormats.TEXT, multiple_values: true},
                colors_label: {format: AttributeFormats.TEXT, multiple_values: true}
            };

            when(mockUtils.isLinkAttribute)
                .calledWith({id: 'bikes_shops', ...attributeProperties.bikes_shops})
                .mockReturnValue(true);

            Object.entries(attributeProperties).forEach(([id, returnValue]) =>
                when(mockAttributeDomain.getAttributeProperties)
                    .calledWith({id, ctx: mockCtx})
                    .mockReturnValue({id, ...returnValue})
            );

            const mockRecordDomain: Mockify<IRecordDomain> = {
                getRecordFieldValue: jest.fn()
            };

            const fieldValues = [
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributeId: 'bikes_sizes',
                    returnValue: [{payload: 'S'}, {payload: 'M'}, {payload: 'L'}, {payload: 'XL'}]
                },
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributeId: 'bikes_shops',
                    returnValue: [{payload: {id: 'shopId'}}, {payload: {id: 'shopId2'}}]
                },
                {
                    library: 'shops',
                    recordId: 'shopId',
                    attributeId: 'shops_label',
                    returnValue: [{payload: 'shopLabel'}]
                },
                {
                    library: 'shops',
                    recordId: 'shopId2',
                    attributeId: 'shops_label',
                    returnValue: [{payload: 'shopLabel2'}]
                },
                {
                    library: 'bikes',
                    recordId: 'bikeId',
                    attributeId: 'colors_label',
                    returnValue: []
                }
            ];

            fieldValues.forEach(({library, recordId, attributeId, returnValue}) =>
                when(mockRecordDomain.getRecordFieldValue)
                    .calledWith({library, record: {id: recordId}, attributeId, ctx: mockCtx})
                    .mockReturnValue(returnValue)
            );

            const domain = exportDomain({
                ...depsBase,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.utils': mockUtils as IUtils
            });

            const data = await domain.exportData(jsonMapping, [{bikes: 'bikeId'}], mockCtx);

            expect(data).toEqual([
                {
                    multivalues_links: 'shopLabel,shopLabel2',
                    multivalues: 'S,M,L,XL',
                    no_values: ''
                }
            ]);
        });
    });
});
