import {type ILogger} from '@leav/logger';
import {type CreateAnalyzerOptions, type CreateNgramAnalyzerOptions} from 'arangojs/analyzer';
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
    config?: IConfig;
    'core.infra.db.dbService'?: IDbService;
    'core.utils.logger'?: ILogger;
}

export default function ({
    config = null,
    'core.infra.db.dbService': dbService = null,
    'core.utils.logger': logger = null,
}: IDeps = {}): IMigration {
    return {
        async run() {
            const analyzers = await dbService.analyzers();
            if (!analyzers.find(a => a.name === `${config.db.name}::${CORE_INDEX_NGRAM_ANALYZER}`)) {
                // streamType is supported by ArangoDB but missing from arangojs 8.8.1 typedef
                const ngramProperties: CreateNgramAnalyzerOptions['properties'] & {streamType?: string} = {
                    min: 3,
                    max: 3,
                    preserveOriginal: false,
                    streamType: 'utf8',
                };
                const ngramOptions: CreateAnalyzerOptions = {
                    type: 'ngram',
                    properties: ngramProperties,
                    features: ['frequency', 'norm', 'position'],
                };
                await dbService.createAnalyzer(CORE_INDEX_NGRAM_ANALYZER, ngramOptions);
            }

            const existingViews = await dbService.views();
            const indexViews = existingViews.filter(v => v.name.startsWith(`${CORE_INDEX_VIEW}_`));

            for (const viewInfo of indexViews) {
                const libraryId = viewInfo.name.slice(`${CORE_INDEX_VIEW}_`.length);
                const view = dbService.db.view(viewInfo.name);

                try {
                    await view.updateProperties({
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
                        `[Migration 021] Skipping view "${viewInfo.name}" (library "${libraryId}"): ${err.message}`,
                    );
                }
            }
        },
    };
}
