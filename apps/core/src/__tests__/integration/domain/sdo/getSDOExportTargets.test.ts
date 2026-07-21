import {type IDbEvent, EventAction} from '@leav/utils';
import {systemUserId} from '../../../../_constants/users';
import {CommonAttributes} from '../../../../_constants/systemAttributes';
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {type IQueryInfos} from '../../../../_types/queryInfos';
import {type IRecord} from '../../../../_types/record';
import {type ISaveValue} from '../../../../_types/value';
import {type ISDOMapping} from '../../../../_types/sdo';
import {type IAttributeDomain} from '../../../../domain/attribute/attributeDomain';
import {type ILibraryDomain} from '../../../../domain/library/libraryDomain';
import {type IRecordDomain} from '../../../../domain/record/recordDomain';
import {type ITreeDomain} from '../../../../domain/tree/treeDomain';
import {type ISDOExportDomain} from '../../../../domain/sdo/export/sdoExportDomain';
import {getCoreDep} from '../../integrationTestUtils';

// Target library = the SDO library. It has one mapped attribute (to exercise UPDATE filtering) and
// declares additionalLibraryTriggers pointing at the trigger libraries below.
const targetLib = 'gset_target';
const TARGET_VALUE_ATTR = 'gset_target_value';

// Single-hop trigger: a library with a direct simple_link to the target.
const triggerLib = 'gset_trigger';
const TRIGGER_LINK_ATTR = 'gset_trigger_link';

// Single-hop trigger, multivalued: same idea through a multivalued advanced_link.
const triggerMultiLib = 'gset_trigger_multi';
const TRIGGER_LINK_MULTI_ATTR = 'gset_trigger_link_multi';

// 2-hop trigger: a library with a tree attribute pointing at an intermediate library, itself
// simple-linked to the target — exercises path traversal through a tree then a link.
const triggerTreeLib = 'gset_trigger_tree';
const TRIGGER_TREE_ATTR = 'gset_trigger_tree_attr';
const triggerTreeId = 'gset_trigger_tree_tree';
const intermediateLib = 'gset_intermediate';
const INTERMEDIATE_LINK_ATTR = 'gset_intermediate_link';

describe('getSDOExportTargets', () => {
    let libraryDomain: ILibraryDomain;
    let attributeDomain: IAttributeDomain;
    let recordDomain: IRecordDomain;
    let treeDomain: ITreeDomain;
    let sdoExportDomain: ISDOExportDomain;

    let target1: IRecord;
    let target2: IRecord;

    const ctx: IQueryInfos = {userId: systemUserId};

    const mapping: ISDOMapping = {
        [targetLib]: {
            leavLibraryId: targetLib,
            sdoAttributes: {
                'info.value': {leavAttributeId: TARGET_VALUE_ATTR, valueRequired: false, format: 'string'},
            },
            additionalLibraryTriggers: [
                {leavLibraryId: triggerLib, leavAttributePath: TRIGGER_LINK_ATTR},
                {leavLibraryId: triggerMultiLib, leavAttributePath: TRIGGER_LINK_MULTI_ATTR},
                {
                    leavLibraryId: triggerTreeLib,
                    leavAttributePath: `${TRIGGER_TREE_ATTR}.${INTERMEDIATE_LINK_ATTR}`,
                },
            ],
        },
    };

    const makeEvent = (action: EventAction, libraryId: string, recordId: string, attribute?: string): IDbEvent =>
        ({
            payload: {
                action,
                topic: {record: {id: recordId, libraryId}, ...(attribute && {attribute})},
            },
        }) as IDbEvent;

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
        recordDomain = getCoreDep<IRecordDomain>('core.domain.record');
        treeDomain = getCoreDep<ITreeDomain>('core.domain.tree');
        sdoExportDomain = getCoreDep<ISDOExportDomain>('core.domain.sdo.export');

        // Target library (+ one mapped attribute) must exist before anything links to it.
        const targetValueAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: TARGET_VALUE_ATTR,
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.TEXT,
                label: {en: 'Target value'},
            },
            ctx,
        });
        await libraryDomain.saveLibrary({id: targetLib, attributes: [targetValueAttr]}, ctx);
        target1 = await createRecord(targetLib);
        target2 = await createRecord(targetLib);

        // Single-hop simple_link trigger.
        const triggerLinkAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: TRIGGER_LINK_ATTR,
                type: AttributeTypes.SIMPLE_LINK,
                linked_library: targetLib,
                label: {en: 'Trigger link'},
            },
            ctx,
        });
        await libraryDomain.saveLibrary({id: triggerLib, attributes: [triggerLinkAttr]}, ctx);

        // Single-hop multivalued advanced_link trigger.
        const triggerLinkMultiAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: TRIGGER_LINK_MULTI_ATTR,
                type: AttributeTypes.ADVANCED_LINK,
                linked_library: targetLib,
                multiple_values: true,
                label: {en: 'Trigger link multi'},
            },
            ctx,
        });
        await libraryDomain.saveLibrary({id: triggerMultiLib, attributes: [triggerLinkMultiAttr]}, ctx);

        // Intermediate library, simple-linked to the target.
        const intermediateLinkAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: INTERMEDIATE_LINK_ATTR,
                type: AttributeTypes.SIMPLE_LINK,
                linked_library: targetLib,
                label: {en: 'Intermediate link'},
            },
            ctx,
        });
        await libraryDomain.saveLibrary({id: intermediateLib, attributes: [intermediateLinkAttr]}, ctx);

        // 2-hop: tree containing the intermediate library, then a tree attribute on the trigger lib.
        await treeDomain.saveTree(
            {
                id: triggerTreeId,
                label: {en: 'Trigger tree'},
                libraries: {
                    [intermediateLib]: {allowedAtRoot: true, allowMultiplePositions: false, allowedChildren: []},
                },
            },
            ctx,
        );
        const triggerTreeAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: TRIGGER_TREE_ATTR,
                type: AttributeTypes.TREE,
                linked_tree: triggerTreeId,
                label: {en: 'Trigger tree attr'},
            },
            ctx,
        });
        await libraryDomain.saveLibrary({id: triggerTreeLib, attributes: [triggerTreeAttr]}, ctx);
    });

    describe('direct match (event on the SDO library itself)', () => {
        test('[+] RECORD_INIT maps to a CREATE export of the event record', async () => {
            const event = makeEvent(EventAction.RECORD_INIT, targetLib, target1.id);

            const targets = await sdoExportDomain.getSDOExportTargets(event, mapping, ctx);

            expect(targets).toEqual([{leavLibraryId: targetLib, recordId: target1.id, action: 'CREATE'}]);
        });

        test('[+] a VALUE_SAVE on a mapped attribute yields an UPDATE export', async () => {
            const event = makeEvent(EventAction.VALUE_SAVE, targetLib, target1.id, TARGET_VALUE_ATTR);

            const targets = await sdoExportDomain.getSDOExportTargets(event, mapping, ctx);

            expect(targets).toEqual([{leavLibraryId: targetLib, recordId: target1.id, action: 'UPDATE'}]);
        });

        test('[+] a VALUE_SAVE on the "active" attribute always yields an UPDATE export', async () => {
            const event = makeEvent(EventAction.VALUE_SAVE, targetLib, target1.id, CommonAttributes.ACTIVE);

            const targets = await sdoExportDomain.getSDOExportTargets(event, mapping, ctx);

            expect(targets).toEqual([{leavLibraryId: targetLib, recordId: target1.id, action: 'UPDATE'}]);
        });

        test('[-] a VALUE_SAVE on an unmapped attribute yields no export target', async () => {
            const event = makeEvent(EventAction.VALUE_SAVE, targetLib, target1.id, 'an_unmapped_attribute');

            const targets = await sdoExportDomain.getSDOExportTargets(event, mapping, ctx);

            expect(targets).toEqual([]);
        });
    });

    describe('additional library triggers (event on a linked library)', () => {
        test('[+] single-hop simple_link resolves to the linked target, forced to UPDATE', async () => {
            const trigger = await createRecord(triggerLib, [{attribute: TRIGGER_LINK_ATTR, payload: target1.id}]);
            // RECORD_INIT (a CREATE action) on the trigger record: the resolved target must still be
            // forced to UPDATE, and the trigger record itself must NOT be exported (no direct mapping).
            const event = makeEvent(EventAction.RECORD_INIT, triggerLib, trigger.id);

            const targets = await sdoExportDomain.getSDOExportTargets(event, mapping, ctx);

            expect(targets).toEqual([{leavLibraryId: targetLib, recordId: target1.id, action: 'UPDATE'}]);
        });

        test('[+] multivalued advanced_link flattens to every linked target', async () => {
            const trigger = await createRecord(triggerMultiLib, [
                {attribute: TRIGGER_LINK_MULTI_ATTR, payload: target1.id},
                {attribute: TRIGGER_LINK_MULTI_ATTR, payload: target2.id},
            ]);
            const event = makeEvent(EventAction.VALUE_SAVE, triggerMultiLib, trigger.id, TRIGGER_LINK_MULTI_ATTR);

            const targets = await sdoExportDomain.getSDOExportTargets(event, mapping, ctx);

            expect(targets).toEqual(
                expect.arrayContaining([
                    {leavLibraryId: targetLib, recordId: target1.id, action: 'UPDATE'},
                    {leavLibraryId: targetLib, recordId: target2.id, action: 'UPDATE'},
                ]),
            );
            expect(targets).toHaveLength(2);
        });

        test('[+] 2-hop tree+link path resolves to the target linked from the intermediate record', async () => {
            const intermediate = await createRecord(intermediateLib, [
                {attribute: INTERMEDIATE_LINK_ATTR, payload: target2.id},
            ]);
            const node = await treeDomain.addElement({
                treeId: triggerTreeId,
                element: {id: intermediate.id, library: intermediateLib},
                parent: null,
                ctx,
            });
            const trigger = await createRecord(triggerTreeLib, [{attribute: TRIGGER_TREE_ATTR, payload: node.id}]);
            const event = makeEvent(EventAction.VALUE_SAVE, triggerTreeLib, trigger.id, TRIGGER_TREE_ATTR);

            const targets = await sdoExportDomain.getSDOExportTargets(event, mapping, ctx);

            expect(targets).toEqual([{leavLibraryId: targetLib, recordId: target2.id, action: 'UPDATE'}]);
        });

        test('[-] a trigger record with no link value yields no export target', async () => {
            const trigger = await createRecord(triggerLib);
            const event = makeEvent(EventAction.VALUE_SAVE, triggerLib, trigger.id, TRIGGER_LINK_ATTR);

            const targets = await sdoExportDomain.getSDOExportTargets(event, mapping, ctx);

            expect(targets).toEqual([]);
        });
    });

    test('[-] an event on a library with neither a mapping nor a trigger yields no target', async () => {
        const event = makeEvent(EventAction.RECORD_INIT, 'a_library_without_any_sdo_config', 'whatever');

        const targets = await sdoExportDomain.getSDOExportTargets(event, mapping, ctx);

        expect(targets).toEqual([]);
    });
});
