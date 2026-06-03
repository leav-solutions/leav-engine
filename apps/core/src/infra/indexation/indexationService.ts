import {type CreateNgramAnalyzerOptions, type CreatePipelineAnalyzerOptions} from 'arangojs/analyzer';
import {type IDbService} from '../db/dbService';
import type * as Config from '../../_types/config';
import {type IRecordRepo} from '../record/recordRepo';
import {type IQueryInfos} from '../../_types/queryInfos';

interface IRecordIndexData {
    [x: string]: string;
}

export interface IIndexationService {
    init(): Promise<void>;
    listLibrary(libraryId: string): Promise<void>;
    isLibraryListed(libraryId: string): Promise<boolean>;
    indexRecord(libraryId: string, recordId: string, data: IRecordIndexData, ctx: IQueryInfos): Promise<void>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.db.dbService'?: IDbService;
    'core.infra.record'?: IRecordRepo;
}

export const CORE_INDEX_INPUT_ANALYZER = 'core_index_input';
export const CORE_INDEX_ANALYZER = 'core_index';
export const CORE_INDEX_NGRAM_ANALYZER = 'core_index_ngram';
export const CORE_INDEX_VIEW = 'core_index';
export const CORE_INDEX_FIELD = 'core_index';
export const CORE_INDEX_NGRAM_THRESHOLD = 0.7;

const _getCoreIndexView = libraryId => `${CORE_INDEX_VIEW}_${libraryId}`;

export default function ({
    config = null,
    'core.infra.db.dbService': dbService = null,
    'core.infra.record': recordRepo = null,
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
                            preserveOriginal: true,
                        },
                    },
                    features: ['frequency', 'norm'],
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
                        stemming: false,
                    },
                    features: ['frequency', 'norm'],
                });
            }

            // Create ngram analyzer for typo-tolerant fuzzy search via NGRAM_MATCH.
            // Pipeline: normalize (lower-case, strip accents) THEN generate ngrams,
            // so indexing "PRODÜIT" and searching "produit" produce overlapping ngrams.
            if (!analyzers.find(a => a.name === `${config.db.name}::${CORE_INDEX_NGRAM_ANALYZER}`)) {
                // streamType is supported by ArangoDB but missing from arangojs 8.8.1 typedef
                const ngramStep: CreateNgramAnalyzerOptions & {properties: {streamType?: string}} = {
                    type: 'ngram',
                    properties: {
                        min: 3,
                        max: 3,
                        preserveOriginal: false,
                        streamType: 'utf8',
                    },
                };
                const pipelineOptions: CreatePipelineAnalyzerOptions = {
                    type: 'pipeline',
                    properties: {
                        pipeline: [
                            {
                                type: 'norm',
                                properties: {locale: 'en', case: 'lower', accent: false},
                            },
                            ngramStep,
                        ],
                    },
                    features: ['frequency', 'norm', 'position'],
                };
                await dbService.createAnalyzer(CORE_INDEX_NGRAM_ANALYZER, pipelineOptions);
            }
        },
        async listLibrary(libraryId: string): Promise<void> {
            const viewName = _getCoreIndexView(libraryId);
            const links = {
                [libraryId]: {
                    analyzers: [CORE_INDEX_ANALYZER, CORE_INDEX_NGRAM_ANALYZER],
                    fields: {
                        [CORE_INDEX_FIELD]: {
                            includeAllFields: true,
                        },
                    },
                },
            };

            const existingViews = await dbService.views();
            if (existingViews.find(v => v.name === viewName)) {
                // View may exist with stale/empty links (e.g. after the underlying collection was dropped).
                // Update its properties so the link is always wired to the current collection.
                await dbService.db.view(viewName).updateProperties({links});
            } else {
                await dbService.createView(viewName, {type: 'arangosearch', links});
            }
        },
        async isLibraryListed(libraryId: string): Promise<boolean> {
            const viewName = _getCoreIndexView(libraryId);
            const views = await dbService.views();
            if (!views.find(v => v.name === viewName)) {
                return false;
            }

            // A view can exist with stale/empty links (e.g. after the underlying collection was dropped).
            // Treat such zombie views as "not listed" so listLibrary re-wires them.
            const props = await dbService.db.view(viewName).properties();
            return !!(props as {links?: object}).links?.[libraryId];
        },
        async indexRecord(libraryId, recordId, data, ctx) {
            await recordRepo.updateRecord({
                libraryId,
                recordData: {id: recordId, [CORE_INDEX_FIELD]: data},
                ctx,
            });
        },
    };
}
