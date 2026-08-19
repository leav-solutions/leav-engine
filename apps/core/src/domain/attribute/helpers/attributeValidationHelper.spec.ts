import {type IAttributeRepo} from '../../../infra/attribute/attributeRepo';
import {type ITreeRepo} from '../../../infra/tree/treeRepo';
import {type IUtils} from '../../../utils/utils';
import {AttributeTypes, TreeSelectableNodes, type IAttribute} from '../../../_types/attribute';
import {Errors} from '../../../_types/errors';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {mockAttrSimple, mockAttrTree} from '../../../__tests__/mocks/attribute';
import {type IActionsListDomain} from '../../actionsList/actionsListDomain';
import {type IVersionProfileDomain} from '../../versionProfile/versionProfileDomain';
import {validateAttributeData} from './attributeValidationHelper';

describe('attributeValidationHelper', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'attributeValidationHelperTest',
    };

    const mockUtils: Mockify<IUtils> = {
        isIdValid: vi.fn().mockReturnValue(true),
    };

    const mockAttributeRepo: Mockify<IAttributeRepo> = {
        getAttributes: global.__mockPromise({list: [], totalCount: 0}),
    };

    const mockActionsListDomain: Mockify<IActionsListDomain> = {
        getAvailableActions: vi.fn().mockReturnValue([]),
    };

    const mockVersionProfileDomain: Mockify<IVersionProfileDomain> = {
        getVersionProfiles: global.__mockPromise({list: [], totalCount: 0}),
    };

    const _getDeps = (treeRepo: Mockify<ITreeRepo>) =>
        ({
            utils: mockUtils,
            treeRepo,
            config: {lang: {default: 'fr'}},
            attributeRepo: mockAttributeRepo,
            actionsListDomain: mockActionsListDomain,
            versionProfileDomain: mockVersionProfileDomain,
        }) as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('tree_selection_conf', () => {
        test('Should not validate anything if there is no conf', async () => {
            const mockTreeRepo: Mockify<ITreeRepo> = {isNodePresent: global.__mockPromise(false)};

            const errors = await validateAttributeData(mockAttrTree as IAttribute, _getDeps(mockTreeRepo), ctx);

            expect(errors).toEqual({});
            expect(mockTreeRepo.isNodePresent).not.toBeCalled();
        });

        test('Should accept a full valid conf', async () => {
            const mockTreeRepo: Mockify<ITreeRepo> = {isNodePresent: global.__mockPromise(true)};

            const errors = await validateAttributeData(
                {
                    ...mockAttrTree,
                    tree_selection_conf: {
                        selectableNodes: TreeSelectableNodes.LEAVES_ONLY,
                        defaultExpanded: true,
                        displayRootNode: 'my_node',
                        maxDepth: 3,
                        showSelectChildrenButton: true,
                        showSelectDescendantsButton: true,
                    },
                } as IAttribute,
                _getDeps(mockTreeRepo),
                ctx,
            );

            expect(errors).toEqual({});
            expect(mockTreeRepo.isNodePresent).toBeCalledWith({
                treeId: mockAttrTree.linked_tree,
                nodeId: 'my_node',
                ctx,
            });
        });

        test('Should reject a conf on a non tree attribute', async () => {
            const mockTreeRepo: Mockify<ITreeRepo> = {isNodePresent: global.__mockPromise(true)};

            await expect(
                validateAttributeData(
                    {...mockAttrSimple, tree_selection_conf: {defaultExpanded: true}},
                    _getDeps(mockTreeRepo),
                    ctx,
                ),
            ).rejects.toMatchObject({
                fields: {
                    tree_selection_conf: {
                        msg: Errors.CANNOT_SAVE_TREE_SELECTION_CONF,
                        vars: {type: AttributeTypes.SIMPLE},
                    },
                },
            });
        });

        test('Should reject a maxDepth lower than 1', async () => {
            const mockTreeRepo: Mockify<ITreeRepo> = {isNodePresent: global.__mockPromise(true)};

            const errors = await validateAttributeData(
                {...mockAttrTree, tree_selection_conf: {maxDepth: 0}} as IAttribute,
                _getDeps(mockTreeRepo),
                ctx,
            );

            expect(errors).toEqual({
                tree_selection_conf: {msg: Errors.INVALID_TREE_SELECTION_CONF, vars: {field: 'maxDepth'}},
            });
        });

        test('Should reject a displayRootNode which is not in the linked tree', async () => {
            const mockTreeRepo: Mockify<ITreeRepo> = {isNodePresent: global.__mockPromise(false)};

            const errors = await validateAttributeData(
                {...mockAttrTree, tree_selection_conf: {displayRootNode: 'unknown_node'}} as IAttribute,
                _getDeps(mockTreeRepo),
                ctx,
            );

            expect(errors).toEqual({tree_selection_conf: Errors.UNKNOWN_NODE});
        });
    });

    describe('column_split_enabled', () => {
        const mockTreeRepo: Mockify<ITreeRepo> = {isNodePresent: global.__mockPromise(true)};

        test('Should not validate anything when disabled', async () => {
            const errors = await validateAttributeData(mockAttrSimple, _getDeps(mockTreeRepo), ctx);

            expect(errors).toEqual({});
        });

        test('Should accept on a tree attribute', async () => {
            const errors = await validateAttributeData(
                {...mockAttrTree, column_split_enabled: true} as IAttribute,
                _getDeps(mockTreeRepo),
                ctx,
            );

            expect(errors).toEqual({});
        });

        test('Should accept on an attribute with a closed values list', async () => {
            const errors = await validateAttributeData(
                {
                    ...mockAttrSimple,
                    column_split_enabled: true,
                    values_list: {enable: true, allowFreeEntry: false},
                } as IAttribute,
                _getDeps(mockTreeRepo),
                ctx,
            );

            expect(errors).toEqual({});
        });

        test('Should reject on an attribute with an open values list', async () => {
            const errors = await validateAttributeData(
                {
                    ...mockAttrSimple,
                    column_split_enabled: true,
                    values_list: {enable: true, allowFreeEntry: true},
                } as IAttribute,
                _getDeps(mockTreeRepo),
                ctx,
            );

            expect(errors).toEqual({
                column_split_enabled: {msg: Errors.INVALID_COLUMN_SPLIT_CONF, vars: {type: AttributeTypes.SIMPLE}},
            });
        });

        test('Should reject on an attribute without any values list', async () => {
            const errors = await validateAttributeData(
                {...mockAttrSimple, column_split_enabled: true} as IAttribute,
                _getDeps(mockTreeRepo),
                ctx,
            );

            expect(errors).toEqual({
                column_split_enabled: {msg: Errors.INVALID_COLUMN_SPLIT_CONF, vars: {type: AttributeTypes.SIMPLE}},
            });
        });
    });
});
