import {type ILogger} from '@leav/logger';
import {type CreateNgramAnalyzerOptions, type CreatePipelineAnalyzerOptions} from 'arangojs/analyzer';
import {type IMigration} from '../../../_types/migration';
import {type IDbService} from '../dbService';
import {
    CORE_INDEX_ANALYZER,
    CORE_INDEX_FIELD,
    CORE_INDEX_NGRAM_ANALYZER,
    CORE_INDEX_VIEW,
} from '../../indexation/indexationService';
import {type IConfig} from '../../../_types/config';

interface IDeps {
    config: IConfig;
    'core.infra.db.dbService': IDbService;
    'core.utils.logger': ILogger;
}

// Replaces the raw ngram analyzer (which kept the original case/accents) with a
// pipeline analyzer that first normalizes input (lower-case, accent stripping)
// then generates ngrams. Required so NGRAM_MATCH matches across case and accents.
export default function ({
    config,
    'core.infra.db.dbService': dbService,
    'core.utils.logger': logger,
}: IDeps): IMigration {
    return {
        async run() {
            const qualifiedAnalyzerName = `${config.db.name}::${CORE_INDEX_NGRAM_ANALYZER}`;
            const existingViews = await dbService.views();
            const indexViews = existingViews.filter(v => v.name.startsWith(`${CORE_INDEX_VIEW}_`));

            // Detach the ngram analyzer from every index view so it can be dropped.
            for (const viewInfo of indexViews) {
                const libraryId = viewInfo.name.slice(`${CORE_INDEX_VIEW}_`.length);
                try {
                    await dbService.db.view(viewInfo.name).updateProperties({
                        links: {
                            [libraryId]: {
                                analyzers: [CORE_INDEX_ANALYZER],
                                fields: {
                                    [CORE_INDEX_FIELD]: {
                                        includeAllFields: true,
                                    },
                                },
                            },
                        },
                    });
                } catch (err) {
                    logger?.warn(
                        `[Migration 022] Could not detach ngram analyzer from view "${viewInfo.name}": ${err.message}`,
                    );
                }
            }

            // Drop the old analyzer (force=true as a safety net in case a view still references it).
            const analyzers = await dbService.analyzers();
            if (analyzers.find(a => a.name === qualifiedAnalyzerName)) {
                try {
                    await dbService.db.analyzer(CORE_INDEX_NGRAM_ANALYZER).drop(true);
                } catch (err) {
                    logger?.warn(
                        `[Migration 022] Could not drop analyzer "${CORE_INDEX_NGRAM_ANALYZER}": ${err.message}`,
                    );
                }
            }

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

            // Re-attach the analyzer so ArangoSearch re-indexes the documents with the new ngrams.
            for (const viewInfo of indexViews) {
                const libraryId = viewInfo.name.slice(`${CORE_INDEX_VIEW}_`.length);
                try {
                    await dbService.db.view(viewInfo.name).updateProperties({
                        links: {
                            [libraryId]: {
                                analyzers: [CORE_INDEX_ANALYZER, CORE_INDEX_NGRAM_ANALYZER],
                                fields: {
                                    [CORE_INDEX_FIELD]: {
                                        includeAllFields: true,
                                    },
                                },
                            },
                        },
                    });
                } catch (err) {
                    logger?.warn(
                        `[Migration 022] Could not re-attach ngram analyzer to view "${viewInfo.name}": ${err.message}`,
                    );
                }
            }
        },
    };
}
