import {systemUserId} from '../../../../_constants/users';
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {type IQueryInfos} from '../../../../_types/queryInfos';
import {type IAttributeDomain} from '../../../../domain/attribute/attributeDomain';
import {type GetAttributeByPath} from '../../../../domain/attribute/helpers/getAttributeByPath';
import {type ILibraryDomain} from '../../../../domain/library/libraryDomain';
import {type ITreeDomain} from '../../../../domain/tree/treeDomain';
import ValidationError from '../../../../errors/ValidationError';
import {getCoreDep} from '../../integrationTestUtils';

const libSource = 'gabp_lib_source';
const libTarget = 'gabp_lib_target';
const treeId = 'gabp_tree';

const SIMPLE_ATTR = 'gabp_simple';
const SIMPLE_LINK_ATTR = 'gabp_simple_link';
const TREE_ATTR = 'gabp_tree_attr';
const TARGET_LABEL_ATTR = 'gabp_target_label';

describe('getAttributeByPath (integration)', () => {
    let libraryDomain: ILibraryDomain;
    let attributeDomain: IAttributeDomain;
    let treeDomain: ITreeDomain;
    let getAttributeByPath: GetAttributeByPath;

    const ctx: IQueryInfos = {userId: systemUserId};

    beforeAll(async () => {
        libraryDomain = getCoreDep<ILibraryDomain>('core.domain.library');
        attributeDomain = getCoreDep<IAttributeDomain>('core.domain.attribute');
        treeDomain = getCoreDep<ITreeDomain>('core.domain.tree');
        getAttributeByPath = getCoreDep<GetAttributeByPath>('core.domain.attribute.helpers.getAttributeByPath');

        const targetLabelAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: TARGET_LABEL_ATTR,
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.TEXT,
                label: {en: 'Target label'},
            },
            ctx,
        });

        // libTarget must exist before libSource (link/tree attributes reference it)
        await libraryDomain.saveLibrary({id: libTarget, attributes: [targetLabelAttr]}, ctx);

        // Tree referencing libTarget (no actual nodes needed: getAttributeByPath only reads the tree's
        // configured libraries, not its content)
        await treeDomain.saveTree(
            {
                id: treeId,
                label: {en: 'Tree'},
                libraries: {
                    [libTarget]: {allowedAtRoot: true, allowMultiplePositions: false, allowedChildren: []},
                },
            },
            ctx,
        );

        const simpleAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: SIMPLE_ATTR,
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.TEXT,
                label: {en: 'Simple'},
            },
            ctx,
        });
        const simpleLinkAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: SIMPLE_LINK_ATTR,
                type: AttributeTypes.SIMPLE_LINK,
                linked_library: libTarget,
                label: {en: 'Simple link'},
            },
            ctx,
        });
        const treeAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: TREE_ATTR,
                type: AttributeTypes.TREE,
                linked_tree: treeId,
                label: {en: 'Tree attr'},
            },
            ctx,
        });

        await libraryDomain.saveLibrary({id: libSource, attributes: [simpleAttr, simpleLinkAttr, treeAttr]}, ctx);
    });

    test('resolves a terminal attribute directly', async () => {
        const attribute = await getAttributeByPath({libraryId: libSource, attributePath: SIMPLE_ATTR, ctx});

        expect(attribute.id).toBe(SIMPLE_ATTR);
    });

    test('resolves a nested attribute through a SIMPLE_LINK', async () => {
        const attribute = await getAttributeByPath({
            libraryId: libSource,
            attributePath: `${SIMPLE_LINK_ATTR}.${TARGET_LABEL_ATTR}`,
            ctx,
        });

        expect(attribute.id).toBe(TARGET_LABEL_ATTR);
    });

    test('resolves a nested attribute through a TREE (any of its libraries)', async () => {
        const attribute = await getAttributeByPath({
            libraryId: libSource,
            attributePath: `${TREE_ATTR}.${TARGET_LABEL_ATTR}`,
            ctx,
        });

        expect(attribute.id).toBe(TARGET_LABEL_ATTR);
    });

    test('throws a ValidationError when the attribute does not exist in the library', async () => {
        await expect(
            getAttributeByPath({libraryId: libSource, attributePath: 'not_an_attribute', ctx}),
        ).rejects.toBeInstanceOf(ValidationError);
    });

    test('throws a ValidationError when a nested segment does not exist in the linked library', async () => {
        await expect(
            getAttributeByPath({libraryId: libSource, attributePath: `${SIMPLE_LINK_ATTR}.not_an_attribute`, ctx}),
        ).rejects.toBeInstanceOf(ValidationError);
    });

    test('throws when an intermediate segment is not a link or tree attribute', async () => {
        await expect(
            getAttributeByPath({libraryId: libSource, attributePath: `${SIMPLE_ATTR}.something`, ctx}),
        ).rejects.toThrow('is not a link or tree attribute');
    });

    test('throws when the tree sub-path is not found in any of the tree libraries', async () => {
        await expect(
            getAttributeByPath({libraryId: libSource, attributePath: `${TREE_ATTR}.not_an_attribute`, ctx}),
        ).rejects.toThrow('not found in any library linked to tree');
    });
});
