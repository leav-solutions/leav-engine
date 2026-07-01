import {systemUserId} from '../../../../_constants/users';
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {type IQueryInfos} from '../../../../_types/queryInfos';
import {type IRecord} from '../../../../_types/record';
import {type ISaveValue} from '../../../../_types/value';
import {type IAttributeDomain} from '../../../../domain/attribute/attributeDomain';
import {type ILibraryDomain} from '../../../../domain/library/libraryDomain';
import {type IRecordDomain} from '../../../../domain/record/recordDomain';
import {type ITreeDomain} from '../../../../domain/tree/treeDomain';
import {type IValueDomain} from '../../../../domain/value/valueDomain';
import ValidationError from '../../../../errors/ValidationError';
import {getCoreDep} from '../../integrationTestUtils';

const libSource = 'grfv_lib_source';
const libTarget = 'grfv_lib_target';
const treeId = 'grfv_tree';

const SIMPLE_LINK_ATTR = 'grfv_simple_link';
const ADV_LINK_MULTI_ATTR = 'grfv_adv_link_multi';
const TREE_ATTR = 'grfv_tree_attr';
const DATE_RANGE_ATTR = 'grfv_date_range';
const TARGET_LABEL_ATTR = 'grfv_target_label';

describe('getRecordFieldValue (deep attributePath)', () => {
    let libraryDomain: ILibraryDomain;
    let attributeDomain: IAttributeDomain;
    let valueDomain: IValueDomain;
    let recordDomain: IRecordDomain;
    let treeDomain: ITreeDomain;

    let target1: IRecord;
    let target2: IRecord;
    let treeNodeId: string;

    const ctx: IQueryInfos = {userId: systemUserId};

    const createRecord = async (library: string, values: ISaveValue[] = []): Promise<IRecord> => {
        const res = await recordDomain.createRecord({library, values, ctx});
        if (res.valuesErrors?.length) {
            throw new Error(`Error creating record: ${JSON.stringify(res.valuesErrors)}`);
        }
        return res.record;
    };

    beforeAll(async () => {
        libraryDomain = getCoreDep<ILibraryDomain>('core.domain.library');
        attributeDomain = getCoreDep<IAttributeDomain>('core.domain.attribute');
        valueDomain = getCoreDep<IValueDomain>('core.domain.value');
        recordDomain = getCoreDep<IRecordDomain>('core.domain.record');
        treeDomain = getCoreDep<ITreeDomain>('core.domain.tree');

        const targetLabelAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: TARGET_LABEL_ATTR,
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.TEXT,
                label: {en: 'Target label'},
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
        const advLinkMultiAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: ADV_LINK_MULTI_ATTR,
                type: AttributeTypes.ADVANCED_LINK,
                linked_library: libTarget,
                multiple_values: true,
                label: {en: 'Advanced link multi'},
            },
            ctx,
        });

        // libTarget must exist before libSource (links reference it)
        await libraryDomain.saveLibrary({id: libTarget, attributes: [targetLabelAttr]}, ctx);

        target1 = await createRecord(libTarget, [{attribute: TARGET_LABEL_ATTR, payload: 'target one'}]);
        target2 = await createRecord(libTarget, [{attribute: TARGET_LABEL_ATTR, payload: 'target two'}]);

        // Tree referencing libTarget, with target1 added as a node
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
        const treeNode = await treeDomain.addElement({
            treeId,
            element: {id: target1.id, library: libTarget},
            parent: null,
            ctx,
        });
        treeNodeId = treeNode.id;

        const treeAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: TREE_ATTR,
                type: AttributeTypes.TREE,
                linked_tree: treeId,
                label: {en: 'Tree attr'},
            },
            ctx,
        });
        const dateRangeAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: DATE_RANGE_ATTR,
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.DATE_RANGE,
                label: {en: 'Date range'},
            },
            ctx,
        });

        await libraryDomain.saveLibrary(
            {id: libSource, attributes: [simpleLinkAttr, advLinkMultiAttr, treeAttr, dateRangeAttr]},
            ctx,
        );
    });

    test('reads a terminal attribute through a SIMPLE_LINK', async () => {
        const record = await createRecord(libSource, [{attribute: SIMPLE_LINK_ATTR, payload: target1.id}]);

        const values = await valueDomain.getRecordFieldValue({
            library: libSource,
            record,
            attributePath: `${SIMPLE_LINK_ATTR}.${TARGET_LABEL_ATTR}`,
            ctx,
        });

        expect(values).toHaveLength(1);
        expect(values[0].payload).toBe('target one');
    });

    test('flattens terminal values across a multivalued ADVANCED_LINK', async () => {
        const record = await createRecord(libSource, [
            {attribute: ADV_LINK_MULTI_ATTR, payload: target1.id},
            {attribute: ADV_LINK_MULTI_ATTR, payload: target2.id},
        ]);

        const values = await valueDomain.getRecordFieldValue({
            library: libSource,
            record,
            attributePath: `${ADV_LINK_MULTI_ATTR}.${TARGET_LABEL_ATTR}`,
            ctx,
        });

        expect(values.map(v => v.payload).sort()).toEqual(['target one', 'target two']);
    });

    test('returns an empty array when the link has no value', async () => {
        const record = await createRecord(libSource);

        const values = await valueDomain.getRecordFieldValue({
            library: libSource,
            record,
            attributePath: `${SIMPLE_LINK_ATTR}.${TARGET_LABEL_ATTR}`,
            ctx,
        });

        expect(values).toEqual([]);
    });

    test('throws a ValidationError when a path segment is unknown', async () => {
        const record = await createRecord(libSource, [{attribute: SIMPLE_LINK_ATTR, payload: target1.id}]);

        await expect(
            valueDomain.getRecordFieldValue({
                library: libSource,
                record,
                attributePath: `${SIMPLE_LINK_ATTR}.not_an_attribute`,
                ctx,
            }),
        ).rejects.toBeInstanceOf(ValidationError);
    });

    test('reads a terminal attribute through a TREE on the node record', async () => {
        const record = await createRecord(libSource, [{attribute: TREE_ATTR, payload: treeNodeId}]);

        const values = await valueDomain.getRecordFieldValue({
            library: libSource,
            record,
            attributePath: `${TREE_ATTR}.${TARGET_LABEL_ATTR}`,
            ctx,
        });

        expect(values).toHaveLength(1);
        expect(values[0].payload).toBe('target one');
    });

    test('reads the "from" / "to" sub-fields of a DATE_RANGE attribute', async () => {
        const record = await createRecord(libSource, [
            {attribute: DATE_RANGE_ATTR, payload: JSON.stringify({from: '1000', to: '2000'})},
        ]);

        const [full] = await valueDomain.getRecordFieldValue({
            library: libSource,
            record,
            attributePath: DATE_RANGE_ATTR,
            ctx,
        });

        const fromValues = await valueDomain.getRecordFieldValue({
            library: libSource,
            record,
            attributePath: `${DATE_RANGE_ATTR}.from`,
            ctx,
        });
        const toValues = await valueDomain.getRecordFieldValue({
            library: libSource,
            record,
            attributePath: `${DATE_RANGE_ATTR}.to`,
            ctx,
        });

        expect(fromValues).toHaveLength(1);
        expect(fromValues[0].payload).toEqual((full.payload as {from: unknown}).from);
        expect(toValues[0].payload).toEqual((full.payload as {to: unknown}).to);
    });
});
