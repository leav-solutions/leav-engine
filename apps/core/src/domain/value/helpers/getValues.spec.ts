// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IElementAncestorsHelper} from '../../tree/helpers/elementAncestors';
import {type IGetDefaultElementHelper} from '../../tree/helpers/getDefaultElement';
import {type IVersionProfileDomain} from '../../versionProfile/versionProfileDomain';
import {type IValueRepo} from '../../../infra/value/valueRepo';
import {type ToAny} from '../../../utils/utils';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IValueVersion} from '../../../_types/value';
import ValidationError from '../../../errors/ValidationError';
import {Errors} from '../../../_types/errors';
import {mockAttrAdvVersionable, mockAttrAdvVersionableSimple} from '../../../__tests__/mocks/attribute';
import {mockVersionProfile} from '../../../__tests__/mocks/versionProfile';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IValidateHelper} from '../../helpers/validate';
import getValuesFactory, {type IGetValuesHelperDeps} from './getValues';
import {AttributeTypes} from '../../../_types/attribute';

const mockRunActionsList = vi.fn().mockImplementation(async ({values}) => values);

const depsBase: ToAny<IGetValuesHelperDeps> = {
    'core.domain.attribute': vi.fn(),
    'core.domain.helpers.validate': vi.fn(),
    'core.domain.tree.helpers.elementAncestors': vi.fn(),
    'core.domain.tree.helpers.getDefaultElement': vi.fn(),
    'core.domain.versionProfile': vi.fn(),
    'core.domain.value.helpers.runActionsList': mockRunActionsList,
    'core.infra.value': vi.fn(),
};

describe('getValues', () => {
    const mockValidateHelper: Mockify<IValidateHelper> = {
        validateLibrary: global.__mockPromise(true),
        validateRecord: global.__mockPromise(true),
        validateLibraryAttribute: global.__mockPromise(true),
    };

    const mockAttribute = {
        id: 'test_attr',
        actions_list: {
            saveValue: [{name: 'validate'}],
            getValue: [{name: 'toNumber'}],
        },
    };

    const mockElementAncestorsHelper: Mockify<IElementAncestorsHelper> = {
        getCachedElementAncestors: global.__mockPromise([
            {id: '7', record: {id: 7, library: 'my_lib'}},
            {id: '8', record: {id: 8, library: 'my_lib'}},
            {id: '9', record: {id: 9, library: 'my_lib'}},
        ]),
    };

    const mockVersionProfileDomain: Mockify<IVersionProfileDomain> = {
        getVersionProfileProperties: global.__mockPromise({...mockVersionProfile, trees: ['my_tree']}),
    };

    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'getValuesTest',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('Should return values', async function () {
        const valueData = [{payload: 'test val', attribute: 'test_attr'}];

        const mockValRepo = {
            getValues: global.__mockPromise(valueData),
        };

        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.SIMPLE}),
        };

        const getValues = getValuesFactory({
            ...depsBase,
            'core.domain.attribute': mockAttrDomain as IAttributeDomain,
            'core.infra.value': mockValRepo as IValueRepo,
            'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
        });

        const resValue = await getValues({
            library: 'test_lib',
            recordId: '12345',
            attribute: 'test_attr',
            ctx,
        });

        expect(mockValRepo.getValues.mock.calls.length).toBe(1);
        expect(resValue).toMatchObject(valueData);
    });

    test('Should return versioned values in simple mode', async function () {
        const version = {my_tree: '12345'};
        const valueData = [
            {
                payload: 'test val',
                attribute: 'test_attr',
                version,
            },
        ];

        const mockValRepo = {
            getValues: global.__mockPromise(valueData),
        };

        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: global.__mockPromise(mockAttrAdvVersionableSimple),
        };

        const getValues = getValuesFactory({
            ...depsBase,
            'core.domain.attribute': mockAttrDomain as IAttributeDomain,
            'core.infra.value': mockValRepo as IValueRepo,
            'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
        });

        const resValue = await getValues({
            library: 'test_lib',
            recordId: '12345',
            attribute: 'test_attr',
            options: {version},
            ctx,
        });

        expect(mockValRepo.getValues.mock.calls.length).toBe(1);
        expect(mockValRepo.getValues.mock.calls[0][0].forceGetAllValues).toBe(false);
        expect(mockValRepo.getValues.mock.calls[0][0].options).toMatchObject({version});
        expect(resValue).toMatchObject(valueData);
    });

    test('Should return versioned values in smart mode', async function () {
        const valueData = [
            {
                payload: 'val1',
                attribute: 'test_attr',
                version: {my_tree: '7'},
            },
            {
                payload: 'val2',
                attribute: 'test_attr',
                version: {my_tree: '8'},
            },
        ];

        const mockValRepo = {
            getValues: global.__mockPromise(valueData),
        };

        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable),
        };

        const getValues = getValuesFactory({
            ...depsBase,
            'core.domain.attribute': mockAttrDomain as IAttributeDomain,
            'core.infra.value': mockValRepo as IValueRepo,
            'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
            'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper,
            'core.domain.versionProfile': mockVersionProfileDomain as IVersionProfileDomain,
        });

        const version: IValueVersion = {my_tree: '9'};

        const resValue = await getValues({
            library: 'test_lib',
            recordId: '12345',
            attribute: 'test_attr',
            options: {version},
            ctx,
        });

        expect(mockValRepo.getValues.mock.calls.length).toBe(1);
        expect(mockValRepo.getValues.mock.calls[0][0].options).toMatchObject({version});

        expect(mockElementAncestorsHelper.getCachedElementAncestors).toBeCalledTimes(1);

        expect(resValue.length).toBe(1);
        expect(resValue[0].payload).toBe('val2');
        expect(resValue[0].version).toMatchObject({my_tree: '8'});
    });

    test('Should return versioned values for default tree node (no version supplied)', async function () {
        const mockGetDefaultElementHelperForRoot: Mockify<IGetDefaultElementHelper> = {
            getDefaultElement: global.__mockPromise({id: '7'}),
        };

        const mockElementAncestorsHelperForRoot: Mockify<IElementAncestorsHelper> = {
            getCachedElementAncestors: global.__mockPromise([
                {
                    id: '7',
                    record: {
                        id: 7,
                        library: 'my_lib',
                    },
                },
            ]),
        };

        const valueData = [
            {
                payload: 'val1',
                attribute: 'test_attr',
                version: {my_tree: '7'},
            },
            {
                payload: 'val2',
                attribute: 'test_attr',
                version: {my_tree: '8'},
            },
        ];

        const mockValRepo = {
            getValues: global.__mockPromise(valueData),
        };

        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable),
        };

        const getValues = getValuesFactory({
            ...depsBase,
            'core.domain.attribute': mockAttrDomain as IAttributeDomain,
            'core.infra.value': mockValRepo as IValueRepo,
            'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
            'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelperForRoot as IElementAncestorsHelper,
            'core.domain.versionProfile': mockVersionProfileDomain as IVersionProfileDomain,
            'core.domain.tree.helpers.getDefaultElement':
                mockGetDefaultElementHelperForRoot as IGetDefaultElementHelper,
        });

        const resValue = await getValues({
            library: 'test_lib',
            recordId: '12345',
            attribute: 'test_attr',
            options: {},
            ctx,
        });

        expect(mockValRepo.getValues.mock.calls.length).toBe(1);

        expect(mockElementAncestorsHelperForRoot.getCachedElementAncestors).toHaveBeenCalledTimes(1);

        expect(resValue.length).toBe(1);
        expect(resValue[0].payload).toBe('val1');
        expect(resValue[0].version).toMatchObject({my_tree: '7'});
    });

    test('Should handle versioned values for default tree node if tree has no elements', async function () {
        const valueData = [
            {
                payload: 'val1',
                attribute: 'test_attr',
                version: {my_tree: '7'},
            },
            {
                payload: 'val2',
                attribute: 'test_attr',
                version: {my_tree: '8'},
            },
        ];

        const mockValRepo = {
            getValues: global.__mockPromise(valueData),
        };

        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable),
        };

        const mockGetDefaultElementHelperNoElement: Mockify<IGetDefaultElementHelper> = {
            getDefaultElement: global.__mockPromise(undefined),
        };

        const getValues = getValuesFactory({
            ...depsBase,
            'core.domain.attribute': mockAttrDomain as IAttributeDomain,
            'core.infra.value': mockValRepo as IValueRepo,
            'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
            'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper,
            'core.domain.versionProfile': mockVersionProfileDomain as IVersionProfileDomain,
            'core.domain.tree.helpers.getDefaultElement':
                mockGetDefaultElementHelperNoElement as IGetDefaultElementHelper,
        });

        const resValue = await getValues({
            library: 'test_lib',
            recordId: '12345',
            attribute: 'test_attr',
            options: {},
            ctx,
        });

        expect(mockValRepo.getValues.mock.calls.length).toBe(1);

        expect(mockElementAncestorsHelper.getCachedElementAncestors).toHaveBeenCalledTimes(0);

        expect(resValue.length).toBe(0);
    });

    test('Should return versioned values with multiple trees', async function () {
        const valueData = [
            {
                payload: 'val1',
                attribute: 'test_attr',
                version: {my_tree: '9', other_tree: '1', third_tree: '88'},
            },
            {
                payload: 'val2',
                attribute: 'test_attr',
                version: {my_tree: '8', other_tree: '2', third_tree: '99'},
            },
            {
                payload: 'val3',
                attribute: 'test_attr',
                version: {my_tree: '8', other_tree: '2', third_tree: '99'},
            },
            {
                payload: 'val4',
                attribute: 'test_attr',
                version: {my_tree: '9', other_tree: '2', third_tree: '88'},
            },
        ];

        const mockValRepo = {
            getValues: global.__mockPromise(valueData),
        };

        const mockAttrAdvVersionableWithThreeTrees = {
            ...mockAttrAdvVersionable,
            versions_conf: {
                versionable: true,
                trees: ['my_tree', 'other_tree', 'third_tree'],
            },
        };

        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: global.__mockPromise(mockAttrAdvVersionableWithThreeTrees),
        };

        const mockElementAncestorsHelperMultipleTrees = {
            ...mockElementAncestorsHelper,
            getCachedElementAncestors: vi.fn().mockImplementation(({treeId}) => {
                let parents;
                switch (treeId) {
                    case 'my_tree':
                        parents = [
                            {id: '7', record: {id: 7, library: 'my_lib'}},
                            {id: '8', record: {id: 8, library: 'my_lib'}},
                            {id: '9', record: {id: 9, library: 'my_lib'}},
                        ];
                        break;
                    case 'other_tree':
                        parents = [
                            {id: '1', record: {id: '1', library: 'my_lib'}},
                            {id: '2', record: {id: 2, library: 'my_lib'}},
                            {id: '3', record: {id: 3, library: 'my_lib'}},
                        ];
                        break;
                    case 'third_tree':
                        parents = [
                            {id: '88', record: {id: '88', library: 'my_lib'}},
                            {id: '99', record: {id: '99', library: 'my_lib'}},
                        ];
                        break;
                }
                return Promise.resolve(parents);
            }),
        };

        const mockVersionProfileDomainMultipleTrees: Mockify<IVersionProfileDomain> = {
            getVersionProfileProperties: global.__mockPromise({
                ...mockVersionProfile,
                trees: ['my_tree', 'other_tree', 'third_tree'],
            }),
        };

        const getValues = getValuesFactory({
            ...depsBase,
            'core.domain.attribute': mockAttrDomain as IAttributeDomain,
            'core.infra.value': mockValRepo as IValueRepo,
            'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
            'core.domain.tree.helpers.elementAncestors':
                mockElementAncestorsHelperMultipleTrees as IElementAncestorsHelper,
            'core.domain.versionProfile': mockVersionProfileDomainMultipleTrees as IVersionProfileDomain,
        });

        const version: IValueVersion = {
            my_tree: '9',
            other_tree: '3',
            third_tree: '99',
        };

        const resValue = await getValues({
            library: 'test_lib',
            recordId: '12345',
            attribute: 'test_attr',
            options: {version},
            ctx,
        });

        expect(mockValRepo.getValues.mock.calls.length).toBe(1);
        expect(mockValRepo.getValues.mock.calls[0][0].options).toMatchObject({version});
        expect(mockElementAncestorsHelperMultipleTrees.getCachedElementAncestors).toBeCalledTimes(3);
        expect(resValue.length).toBe(2);
        expect(resValue[0].payload).toBe('val2');
        expect(resValue[1].payload).toBe('val3');
        expect(resValue[0].version).toMatchObject({
            my_tree: '8',
            other_tree: '2',
            third_tree: '99',
        });
    });

    test('Should return empty array if no values matching version', async function () {
        const valueData = [
            {
                payload: 'val1',
                attribute: 'test_attr',
                version: {my_tree: '99'},
            },
            {
                payload: 'val2',
                attribute: 'test_attr',
                version: {my_tree: '88'},
            },
        ];

        const mockValRepo = {
            getValues: global.__mockPromise(valueData),
        };

        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable),
        };

        const getValues = getValuesFactory({
            ...depsBase,
            'core.domain.attribute': mockAttrDomain as IAttributeDomain,
            'core.infra.value': mockValRepo as IValueRepo,
            'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
            'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper,
            'core.domain.versionProfile': mockVersionProfileDomain as IVersionProfileDomain,
        });

        const version: IValueVersion = {my_tree: '9'};

        const resValue = await getValues({
            library: 'test_lib',
            recordId: '12345',
            attribute: 'test_attr',
            options: {version},
            ctx,
        });

        expect(resValue.length).toBe(0);
    });

    test('Should throw if unknown attribute', async function () {
        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: vi.fn().mockImplementationOnce(() => {
                throw new ValidationError({id: Errors.UNKNOWN_ATTRIBUTE});
            }),
        };

        const getValues = getValuesFactory({
            ...depsBase,
            'core.domain.attribute': mockAttrDomain as IAttributeDomain,
        });

        await expect(
            getValues({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                ctx,
            }),
        ).rejects.toThrow();
    });

    test('Should throw if unknown library', async function () {
        const mockValidHelper: Mockify<IValidateHelper> = {
            validateLibrary: vi.fn().mockImplementation(() => {
                throw new ValidationError({library: Errors.UNKNOWN_LIBRARY});
            }),
            validateRecord: global.__mockPromise(true),
        };

        const getValues = getValuesFactory({
            ...depsBase,
            'core.domain.helpers.validate': mockValidHelper as IValidateHelper,
        });

        const getVal = getValues({
            library: 'test_lib',
            recordId: '12345',
            attribute: 'test_attr',
            ctx,
        });

        await expect(getVal).rejects.toThrow(ValidationError);
        await expect(getVal).rejects.toHaveProperty('fields.library');
    });

    test('Should throw if unknown record', async function () {
        const mockValidHelper: Mockify<IValidateHelper> = {
            validateRecord: vi.fn().mockImplementation(() => {
                throw new ValidationError({recordId: Errors.UNKNOWN_RECORD});
            }),
            validateLibrary: global.__mockPromise(true),
        };

        const getValues = getValuesFactory({
            ...depsBase,
            'core.domain.helpers.validate': mockValidHelper as IValidateHelper,
        });

        const getVal = getValues({
            library: 'test_lib',
            recordId: '12345',
            attribute: 'test_attr',
            ctx,
        });

        await expect(getVal).rejects.toThrow(ValidationError);
        await expect(getVal).rejects.toHaveProperty('fields.recordId');
    });
});
