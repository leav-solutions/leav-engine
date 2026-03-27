// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {type IEventsManagerDomain} from '../../eventsManager/eventsManagerDomain';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {RecordPermissionsActions} from '../../../_types/permissions';
import {type IRecordPermissionDomain} from '../../permission/recordPermissionDomain';
import PermissionError from '../../../errors/PermissionError';
import {EventAction} from '@leav/utils';
import {type IRecordRepo} from '../../../infra/record/recordRepo';
import {type ITreeRepo} from '../../../infra/tree/treeRepo';
import {type IValueRepo} from '../../../infra/value/valueRepo';
import {type IRecord} from '../../../_types/record';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {AttributeTypes} from '../../../_types/attribute';
import {type IAttributeSimpleLinkRepo} from '../../../infra/attributeTypes/attributeSimpleLinkRepo';
import {type IValueDomain} from '../../value/valueDomain';
import {type IfLibraryJoinLinkAttribute} from '../../attribute/helpers/ifLibraryJoinLinkAttribute';

export type DeleteRecordHelper = (library: string, id: string, ctx: IQueryInfos) => Promise<IRecord>;

interface IDeps {
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.domain.permission.record': IRecordPermissionDomain;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.value': IValueDomain;
    'core.infra.attributeTypes.attributeSimpleLink'?: IAttributeSimpleLinkRepo;
    'core.domain.attribute.helpers.ifLibraryJoinLinkAttribute': IfLibraryJoinLinkAttribute;
    'core.infra.record': IRecordRepo;
    'core.infra.tree': ITreeRepo;
    'core.infra.value': IValueRepo;
}

export default function ({
    'core.domain.eventsManager': eventsManager,
    'core.domain.permission.record': recordPermissionDomain,
    'core.domain.attribute': attributeDomain,
    'core.domain.value': valueDomain,
    'core.infra.attributeTypes.attributeSimpleLink': attributeSimpleLinkRepo,
    'core.domain.attribute.helpers.ifLibraryJoinLinkAttribute': ifLibraryJoinLinkAttribute,
    'core.infra.record': recordRepo,
    'core.infra.tree': treeRepo,
    'core.infra.value': valueRepo,
}: IDeps): DeleteRecordHelper {
    return async (library, id, ctx) => {
        // Check permission
        const canDelete = await recordPermissionDomain.getRecordPermission({
            action: RecordPermissionsActions.DELETE_RECORD,
            library,
            recordId: id,
            ctx,
        });

        if (!canDelete) {
            throw new PermissionError(RecordPermissionsActions.DELETE_RECORD);
        }

        const libAttributes = await attributeDomain.getLibraryAttributes(library, ctx);

        for (const attribute of libAttributes) {
            // delete linked join record to avoid orphans, this will deactivate them and will be purge too after with cron purge task
            await ifLibraryJoinLinkAttribute(
                attribute,
                async (joinLibId: string) => {
                    const linkValues = await valueDomain.getValues({
                        library,
                        recordId: id,
                        attribute: attribute.id,
                        ctx,
                    });
                    for (const linkValue of linkValues) {
                        await valueDomain.saveValue({
                            library: joinLibId,
                            recordId: linkValue.payload.id,
                            attribute: 'active',
                            value: {payload: false},
                            ctx,
                        });
                    }
                },
                ctx,
            );
        }

        // delete simple link that point to the record to delete
        const attributesLinkedToLib = await attributeDomain.getAttributes({
            params: {
                filters: {
                    linked_library: library,
                },
            },
            ctx,
        });
        for (const attribute of attributesLinkedToLib.list) {
            if (attribute.type === AttributeTypes.SIMPLE_LINK) {
                const attributeLibraries = await attributeDomain.getAttributeLibraries({
                    attributeId: attribute.id,
                    ctx,
                });
                await Promise.all(
                    attributeLibraries.map(async lib => {
                        logger.silly(
                            `Deleting simple link attribute values linked to record ${id} on attribute ${attribute.id} in library ${lib.id}`,
                        );
                        await attributeSimpleLinkRepo.deleteAllLinkValueTo(lib.id, attribute, id, ctx);
                    }),
                );
            }
        }

        // simple link attribute value are directly in record data in db, so will be deleted with record itself

        // Delete linked values (advanced, advanced link and tree)
        await valueRepo.deleteAllValuesByRecord({libraryId: library, recordId: id, ctx});

        // Remove element from all trees
        const libraryTrees = await treeRepo.getTrees({
            params: {
                filters: {
                    library,
                },
            },
            ctx,
        });

        // For each tree, get all record nodes
        await Promise.all(
            libraryTrees.list.map(async tree => {
                const nodes = await treeRepo.getNodesByRecord({
                    treeId: tree.id,
                    record: {
                        id,
                        library,
                    },
                    ctx,
                });

                for (const node of nodes) {
                    await treeRepo.deleteElement({
                        treeId: tree.id,
                        nodeId: node,
                        deleteChildren: true,
                        ctx,
                    });
                }
            }),
        );

        // Everything is clean, we can actually delete the record
        const deletedRecord = await recordRepo.deleteRecord({libraryId: library, recordId: id, ctx});

        await eventsManager.sendDatabaseEvent<EventAction.RECORD_DELETE>(
            {
                action: EventAction.RECORD_DELETE,
                topic: {
                    record: {
                        libraryId: deletedRecord.library,
                        id: deletedRecord.id,
                    },
                },
                before: deletedRecord,
            },
            ctx,
        );

        return deletedRecord;
    };
}
