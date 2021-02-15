// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import moment from 'moment';
import {IConfig} from '_types/config';
import {IMigration} from '_types/migration';
import {LIB_COLLECTION_NAME} from '../../../infra/library/libraryRepo';
import {VIEWS_COLLECTION_NAME} from '../../../infra/view/_types';
import {ViewTypes} from '../../../_types/views';
import {IDbService} from '../dbService';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    config?: IConfig;
}

export default function ({'core.infra.db.dbService': dbService = null, config = null}: IDeps = {}): IMigration {
    return {
        async run(ctx) {
            if (!(await dbService.collectionExists('core_views'))) {
                await dbService.createCollection('core_views');
            }

            //Check if files library already has a default view
            const res = await dbService.execute({
                query: aql`
                FOR l IN core_libraries
                FILTER l._key == 'files'
                RETURN l.defaultView
                `,
                ctx: {userId: '1'}
            });

            if (!res[0]) {
                const now = moment().unix();
                // Create a default view for files
                const filesDefaultView: IView = {
                    label: {fr: 'Vue mosaique', en: 'Mosaic view'},
                    type: ViewTypes.CARDS,
                    created_by: ctx.userId,
                    created_at: now,
                    modified_at: now,
                    shared: true,
                    library: 'files',
                    settings: {}
                };

                const viewsCollec = dbService.db.collection(VIEWS_COLLECTION_NAME);
                const createdView = await dbService.execute({
                    query: aql`INSERT ${filesDefaultView} INTO ${viewsCollec} RETURN NEW`,
                    ctx
                });
                const viewId = createdView[0]._key;

                // Set it as default
                const libsCollec = dbService.db.collection(LIB_COLLECTION_NAME);
                await dbService.execute({
                    query: aql`
                        UPDATE ${{_key: 'files'}}
                            WITH ${{defaultView: viewId}}
                            IN ${libsCollec}
                        RETURN NEW`,
                    ctx
                });
            }
        }
    };
}
