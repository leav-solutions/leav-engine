// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {type IMigration} from '../../../_types/migration';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IDbService} from '../dbService';
import {type ILogger} from '@leav/logger';
import {APPLICATIONS_COLLECTION_NAME} from '../../application/applicationRepo';
import {LIB_COLLECTION_NAME} from '../../library/libraryRepo';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.utils.logger'?: ILogger;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.utils.logger': logger = null,
}: IDeps = {}): IMigration {
    const _moveLibrariesPanelsFromApplicationsToLibrarySettings = async (ctx: IQueryInfos) => {
        const applicationsCol = dbService.db.collection(APPLICATIONS_COLLECTION_NAME);
        const librariesCol = dbService.db.collection(LIB_COLLECTION_NAME);

        const applications = await dbService.execute({
            query: aql`
                FOR app IN ${applicationsCol}
                    RETURN app
            `,
            ctx,
        });

        for (const application of applications) {
            if (application?.settings?.application?.libraries === undefined) {
                continue;
            }

            for (const libraryId of Object.keys(application.settings.application.libraries)) {
                const libraryFromDb = await dbService.execute({
                    query: aql`
                        FOR lib IN ${librariesCol}
                            FILTER lib._key == ${libraryId}
                            RETURN lib
                    `,
                    ctx,
                });

                if (libraryFromDb.length === 0 || !libraryFromDb[0]) {
                    logger.warn(`Library ${libraryId} not found`);
                    continue;
                }

                const library = libraryFromDb[0];

                const librarySettingsToSave = {
                    settings: {
                        ...library?.settings,
                        applications: {
                            ...library?.settings?.applications,
                            [application._key]: application.settings.application.libraries[libraryId],
                        },
                    },
                };

                await dbService.execute({
                    query: aql`
                        UPDATE ${library._key} WITH ${librarySettingsToSave} IN ${librariesCol} OPTIONS { mergeObjects: false }
                    `,
                    ctx,
                });

                logger.debug(
                    `Update settings for library "${library._key}" to add library panels from application "${application._key}"`,
                );
            }

            const applicationSettingsToSave = {
                settings: {
                    ...application.settings,
                    application: {
                        workspaces: application.settings.application.workspaces,
                    },
                },
            };

            await dbService.execute({
                query: aql`
                    UPDATE ${application._key} WITH ${applicationSettingsToSave} IN ${applicationsCol} OPTIONS { mergeObjects: false }
                `,
                ctx,
            });

            logger.debug(`Update settings for application "${application._key}" to remove library panels`);
        }
    };

    return {
        async run(ctx) {
            await _moveLibrariesPanelsFromApplicationsToLibrarySettings(ctx);
        },
    };
}
