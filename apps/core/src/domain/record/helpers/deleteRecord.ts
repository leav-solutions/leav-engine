// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IQueryInfos} from '../../../_types/queryInfos';
import {RecordPermissionsActions} from '../../../_types/permissions';
import {IRecordPermissionDomain} from 'domain/permission/recordPermissionDomain';
import {IValidateHelper} from 'domain/helpers/validate';
import PermissionError from '../../../errors/PermissionError';
import {EventAction} from '@leav/utils';
import {IRecordRepo} from 'infra/record/recordRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IRecord} from '../../../_types/record';

export type DeleteRecordHelper = (
    library: string,
    id: string,
    ctx: IQueryInfos
) => Promise<IRecord>;

interface IDeps {
    'core.domain.helpers.validate': IValidateHelper;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.domain.permission.record': IRecordPermissionDomain;
    'core.infra.record': IRecordRepo;
    'core.infra.tree': ITreeRepo;
    'core.infra.value': IValueRepo;
}

export default function ({
    'core.domain.eventsManager': eventsManager,
    'core.domain.helpers.validate': validateHelper,
    'core.domain.permission.record': recordPermissionDomain,
    'core.infra.record': recordRepo,
    'core.infra.tree': treeRepo,
    'core.infra.value': valueRepo
}: IDeps): DeleteRecordHelper {
    return async (library, id, ctx) => {
        await validateHelper.validateLibrary(library, ctx);

        // Check permission
        const canDelete = await recordPermissionDomain.getRecordPermission({
            action: RecordPermissionsActions.DELETE_RECORD,
            userId: ctx.userId,
            library,
            recordId: id,
            ctx
        });

        if (!canDelete) {
            throw new PermissionError(RecordPermissionsActions.DELETE_RECORD);
        }

        // why because values are directly in record data ?
        // to execute delete value action,
        // but why not for advanced link and tree ?

        // const simpleLinkedRecords = await _getSimpleLinkedRecords(library, id, ctx);

        // // delete simple linked values
        // for (const e of simpleLinkedRecords) {
        //     for (const r of e.records) {
        //         await valueDomain.deleteValue({
        //             library: r.library,
        //             recordId: r.id,
        //             attribute: e.attribute,
        //             ctx
        //         });
        //     }
        // }

        // Delete linked values (advanced, advanced link and tree)
        await valueRepo.deleteAllValuesByRecord({libraryId: library, recordId: id, ctx});

        // Remove element from all trees
        const libraryTrees = await treeRepo.getTrees({
            params: {
                filters: {
                    library
                }
            },
            ctx
        });

        // For each tree, get all record nodes
        await Promise.all(
            libraryTrees.list.map(async tree => {
                const nodes = await treeRepo.getNodesByRecord({
                    treeId: tree.id,
                    record: {
                        id,
                        library
                    },
                    ctx
                });

                for (const node of nodes) {
                    await treeRepo.deleteElement({
                        treeId: tree.id,
                        nodeId: node,
                        deleteChildren: true,
                        ctx
                    });
                }
            })
        );

        // Everything is clean, we can actually delete the record
        const deletedRecord = await recordRepo.deleteRecord({libraryId: library, recordId: id, ctx});

        await eventsManager.sendDatabaseEvent(
            {
                action: EventAction.RECORD_DELETE,
                topic: {
                    record: {
                        libraryId: deletedRecord.library,
                        id: deletedRecord.id
                    }
                },
                before: deletedRecord
            },
            ctx
        );

        return deletedRecord;
    };
}
