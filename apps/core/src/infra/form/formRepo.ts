// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IDbService} from 'infra/db/dbService';
import {IDbUtils} from 'infra/db/dbUtils';
import {IForm, IFormFilterOptions, IFormStrict} from '_types/forms';
import {IList} from '_types/list';
import {IGetCoreEntitiesParams} from '_types/shared';
import {IQueryInfos} from '_types/queryInfos';

export const FORM_COLLECTION_NAME = 'core_forms';

export interface IFormRepo {
    getForms({params, ctx}: {params?: IGetCoreEntitiesParams; ctx: IQueryInfos}): Promise<IList<IForm>>;
    updateForm({formData, ctx}: {formData: IFormStrict; ctx: IQueryInfos}): Promise<IForm>;
    createForm({formData, ctx}: {formData: IFormStrict; ctx: IQueryInfos}): Promise<IForm>;
    deleteForm({formData, ctx}: {formData: IForm; ctx: IQueryInfos}): Promise<IForm>;
}

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null
}: IDeps = {}): IFormRepo {
    const _generateKey = (form: Pick<IForm, 'id' | 'library'>) => `${form.library}__${form.id}`;
    const _cleanKey = (key: string) => key.substring(key.indexOf('__') + 2);
    const _cleanDocForm = formDoc => {
        const cleanRes = dbUtils.cleanup(formDoc);
        return {...cleanRes, id: _cleanKey(cleanRes.id)};
    };

    return {
        async getForms({params, ctx}): Promise<IList<IForm>> {
            const defaultParams: IGetCoreEntitiesParams = {
                filters: null,
                strictFilters: false,
                withCount: false,
                pagination: null,
                sort: null
            };
            const initializedParams = {...defaultParams, ...params};

            // Convert ID filter if any
            if (!!initializedParams?.filters?.id) {
                initializedParams.filters.id = _generateKey({
                    id: initializedParams.filters.id,
                    library: (initializedParams.filters as IFormFilterOptions).library
                });
            }

            const res = await dbUtils.findCoreEntity<IForm>({
                ...initializedParams,
                collectionName: FORM_COLLECTION_NAME,
                ctx
            });

            // Convert id to user friendly id
            return {...res, list: res.list.map(f => ({...f, id: _cleanKey(f.id)}))};
        },
        async updateForm({formData, ctx}): Promise<IForm> {
            const docToInsert = dbUtils.convertToDoc(formData);
            docToInsert._key = _generateKey(formData); // Prevent duplicates keys

            // Insert in libraries collection
            const col = dbService.db.collection(FORM_COLLECTION_NAME);
            const res = await dbService.execute({
                query: aql`UPDATE ${docToInsert} IN ${col} RETURN NEW`,
                ctx
            });

            return _cleanDocForm(res.pop());
        },
        async createForm({formData, ctx}): Promise<IForm> {
            const docToInsert = dbUtils.convertToDoc(formData);
            docToInsert._key = _generateKey(formData); // Prevent duplicates keys

            // Insert in libraries collection
            const col = dbService.db.collection(FORM_COLLECTION_NAME);
            const res = await dbService.execute({
                query: aql`INSERT ${docToInsert} IN ${col} RETURN NEW`,
                ctx
            });

            return _cleanDocForm(res.pop());
        },
        async deleteForm({formData, ctx}): Promise<IForm> {
            const docToDelete = dbUtils.convertToDoc(formData);
            docToDelete._key = _generateKey(formData); // Prevent duplicates keys

            // Insert in libraries collection
            const col = dbService.db.collection(FORM_COLLECTION_NAME);
            const res = await dbService.execute({
                query: aql`REMOVE ${docToDelete} IN ${col} RETURN OLD`,
                ctx
            });

            return _cleanDocForm(res.pop());
        }
    };
}
