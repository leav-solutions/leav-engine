import {aql} from 'arangojs';
import {type IDbService} from '../dbService';
import {type IMigration} from '../../../_types/migration';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {APPLICATIONS_COLLECTION_NAME} from '../../application/applicationRepo';
import {LIB_COLLECTION_NAME} from '../../library/libraryRepo';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function ({'core.infra.db.dbService': dbService}: IDeps): IMigration {
    const APP_STUDIO_KEY = 'app-studio';
    const CAMPAIGNS_MANAGER_KEY = 'campaigns_manager';

    const _renameApplicationInLibraries = async (ctx: IQueryInfos) => {
        const librariesCol = dbService.db.collection(LIB_COLLECTION_NAME);

        const librariesFromDb = await dbService.execute({
            query: aql`
                FOR lib IN ${librariesCol}
                    RETURN lib
            `,
            ctx,
        });

        for (const library of librariesFromDb) {
            if (library?.settings?.applications === undefined) {
                continue;
            }

            if (library.settings.applications[APP_STUDIO_KEY] === undefined) {
                continue;
            }

            library.settings.applications[CAMPAIGNS_MANAGER_KEY] = library.settings.applications[APP_STUDIO_KEY];
            delete library.settings.applications[APP_STUDIO_KEY];

            await dbService.execute({
                query: aql`
                    UPDATE ${library._key} WITH ${library} IN ${librariesCol} OPTIONS { mergeObjects: false }
                `,
                ctx,
            });
        }
    };

    const _renameApplication = async (ctx: IQueryInfos) => {
        const applicationsCol = dbService.db.collection(APPLICATIONS_COLLECTION_NAME);

        // Check if from app already exists
        const existingAppFromDb = await dbService.execute({
            query: aql`
                FOR app IN ${applicationsCol}
                    FILTER app._key == ${APP_STUDIO_KEY}
                    RETURN app
            `,
            ctx,
        });

        if (!existingAppFromDb.length) {
            // There is no longer application with app-studio key, we can exit
            return;
        }

        const appStudioApp = existingAppFromDb[0];

        const campaignsManagerApp = {
            ...appStudioApp,
            _key: CAMPAIGNS_MANAGER_KEY,
        };

        // Insert new application campaigns_manager
        await dbService.execute({
            query: aql`
                    INSERT ${campaignsManagerApp} INTO ${applicationsCol}
                `,
            ctx,
        });

        await _renameApplicationInLibraries(ctx);

        // Remove old application app-studio
        await dbService.execute({
            query: aql`
                    REMOVE ${appStudioApp} INTO ${applicationsCol}
                `,
            ctx,
        });
    };

    return {
        async run(ctx) {
            await _renameApplication(ctx);
        },
    };
}
