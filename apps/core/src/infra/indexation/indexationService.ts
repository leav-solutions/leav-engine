// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IDbService} from '../db/dbService';
import * as Config from '_types/config';
import {IRecordRepo} from 'infra/record/recordRepo';
import {GetSearchQuery} from './helpers/getSearchQuery';

interface IRecordIndexData {
    [x: string]: string;
}

export interface IIndexationService {
    init(): Promise<void>;
    listLibrary(libraryId: string): Promise<void>;
    isLibraryListed(libraryId: string): Promise<boolean>;
    indexRecord(libraryId: string, recordId: string, data: IRecordIndexData): Promise<void>;
    getSearchQuery: GetSearchQuery;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.db.dbService'?: IDbService;
    'core.infra.record'?: IRecordRepo;
    'core.infra.indexation.helpers.getSearchQuery'?: GetSearchQuery;
}

export const CORE_INDEX_INPUT_ANALYZER = 'core_index_input';
export const CORE_INDEX_ANALYZER = 'core_index';
export const CORE_INDEX_VIEW = 'core_index';
export const CORE_INDEX_FIELD = 'core_index';

const _getCoreIndexView = libraryId => `${CORE_INDEX_VIEW}_${libraryId}`;

export default function ({
    config = null,
    'core.infra.db.dbService': dbService = null,
    'core.infra.record': recordRepo = null,
    'core.infra.indexation.helpers.getSearchQuery': getSearchQuery = null
}: IDeps): IIndexationService {
    return {
        async init(): Promise<void> {
            // Create indexation analyzer
            const analyzers = await dbService.analyzers();

            // Create analyzer used by the view
            if (!analyzers.find(a => a.name === `${config.db.name}::${CORE_INDEX_ANALYZER}`)) {
                // Create norm analyzer used by indexation manager
                await dbService.createAnalyzer(CORE_INDEX_ANALYZER, {
                    type: 'text',
                    properties: {
                        locale: 'en',
                        case: 'lower',
                        accent: false,
                        stemming: false,
                        edgeNgram: {
                            preserveOriginal: true
                        }
                    },
                    features: ['frequency', 'norm']
                });
            }

            // Create analyzer to apply on search input
            if (!analyzers.find(a => a.name === `${config.db.name}::${CORE_INDEX_INPUT_ANALYZER}`)) {
                // Create norm analyzer used by indexation manager
                await dbService.createAnalyzer(CORE_INDEX_INPUT_ANALYZER, {
                    type: 'text',
                    properties: {
                        locale: 'en',
                        case: 'lower',
                        accent: false,
                        stemming: false
                    },
                    features: ['frequency', 'norm']
                });
            }
        },
        async listLibrary(libraryId: string): Promise<void> {
            await dbService.createView(_getCoreIndexView(libraryId), {
                type: 'arangosearch',
                links: {
                    [libraryId]: {
                        analyzers: [CORE_INDEX_ANALYZER],
                        fields: {
                            [CORE_INDEX_FIELD]: {
                                includeAllFields: true
                            }
                        }
                    }
                }
            });
        },
        async isLibraryListed(libraryId: string): Promise<boolean> {
            const views = await dbService.views();
            return !!views.find(v => v.name === _getCoreIndexView(libraryId));
        },
        async indexRecord(libraryId: string, recordId: string, data: IRecordIndexData): Promise<void> {
            await recordRepo.updateRecord({
                libraryId,
                recordData: {id: recordId, [CORE_INDEX_FIELD]: data},
                mergeObjects: true
            });
        },
        getSearchQuery
    };
}
