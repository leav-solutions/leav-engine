// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {IRecordRepo} from 'infra/record/recordRepo';
import {IViewRepo} from 'infra/view/_types';
import {IQueryInfos} from '_types/queryInfos';
import ValidationError from '../../errors/ValidationError';
import {AttributeTypes} from '../../_types/attribute';
import {AttributeCondition} from '../../_types/record';
import {Errors} from '../../_types/errors';

interface IDeps {
    'core.infra.library'?: ILibraryRepo;
    'core.infra.record'?: IRecordRepo;
    'core.infra.view'?: IViewRepo;
}

export interface IValidateHelper {
    validateLibrary(library: string, ctx: IQueryInfos): Promise<void>;
    validateRecord(library: string, record: string, ctx: IQueryInfos): Promise<void>;
    validateView(view: string, throwIfNotFound: boolean, ctx: IQueryInfos): Promise<boolean>;
}

export default function ({
    'core.infra.library': libraryRepo = null,
    'core.infra.record': recordRepo = null,
    'core.infra.view': viewRepo = null
}: IDeps): IValidateHelper {
    return {
        async validateRecord(library: string, record: string, ctx: IQueryInfos): Promise<void> {
            const recordsRes = await recordRepo.find({
                libraryId: library,
                filters: [
                    {
                        attributes: [{id: 'id', type: AttributeTypes.SIMPLE}],
                        condition: AttributeCondition.EQUAL,
                        value: String(record)
                    }
                ],
                retrieveInactive: true,
                ctx
            });

            if (!recordsRes.list.length) {
                throw new ValidationError({recordId: Errors.UNKNOWN_RECORD});
            }
        },
        async validateLibrary(library: string, ctx: IQueryInfos): Promise<void> {
            const lib = await libraryRepo.getLibraries({params: {filters: {id: library}}, ctx});
            // Check if exists and can delete
            if (!lib.list.length) {
                throw new ValidationError({library: Errors.UNKNOWN_LIBRARY});
            }
        },
        async validateView(view: string, throwIfNotFound: boolean, ctx: IQueryInfos): Promise<boolean> {
            const existingView = await viewRepo.getViews(
                {
                    filters: {id: view},
                    strictFilters: true
                },
                ctx
            );

            if (!existingView.list.length) {
                if (throwIfNotFound) {
                    throw new ValidationError({id: Errors.UNKNOWN_VIEW});
                } else {
                    return false;
                }
            }

            return true;
        }
    };
}
