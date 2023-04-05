// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IMigration} from '_types/migration';
import {IDbService} from '../dbService';
import {IConfig} from '_types/config';
import {CORE_INDEX_ANALYZER, CORE_INDEX_INPUT_ANALYZER, CORE_INDEX_VIEW} from '../../indexation/indexationService';

interface IDeps {
    config?: IConfig;
    'core.infra.db.dbService'?: IDbService;
}

export default function ({config = null, 'core.infra.db.dbService': dbService = null}: IDeps = {}): IMigration {
    const _deleteAnalyzers = async () => {
        const analyzers = await dbService.analyzers();

        const coreIndexAnalyzer = analyzers.find(a => a.name === `${config.db.name}::${CORE_INDEX_ANALYZER}`);
        const coreIndexInputAnalyzer = analyzers.find(
            a => a.name === `${config.db.name}::${CORE_INDEX_INPUT_ANALYZER}`
        );

        if (coreIndexAnalyzer) {
            await coreIndexAnalyzer.drop(true);
        }

        if (coreIndexInputAnalyzer) {
            await coreIndexInputAnalyzer.drop(true);
        }
    };

    const _deleteViews = async () => {
        const views = await dbService.views();

        for (const v of views) {
            if (v.name.includes(CORE_INDEX_VIEW)) {
                await v.drop();
            }
        }
    };

    return {
        async run(ctx) {
            await _deleteViews();
            await _deleteAnalyzers();
        }
    };
}
