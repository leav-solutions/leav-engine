import {logger} from '@leav/logger';
import {type IMigration} from '../../../_types/migration';
import {type IGlobalSettingsRepo} from '../../globalSettings/globalSettingsRepo';
import {type ISDOMapping, type ISDOSettings} from '../../../_types/sdo';

interface IDeps {
    'core.infra.globalSettings'?: IGlobalSettingsRepo;
}

/**
 * LEAVC-1091 introduces a per-entity `importEnable` in the SDO mapping, defaulting to `false`. On an
 * instance already importing SDOs, deploying that default would silently stop every import.
 *
 * This migration preserves the behaviour in place: every mapped entity that does not state its
 * intent yet is turned importable, leaving it to the ops to disable the ones they do not want.
 *
 * The mapping lives in `globalSettings.settings.sdo` (free-form JSON, no schema), so it is read and
 * rewritten through the repo — the domain would require the `EDIT_GLOBAL_SETTINGS` admin permission.
 */
export default function ({'core.infra.globalSettings': globalSettingsRepo = null}: IDeps = {}): IMigration {
    return {
        async run(ctx) {
            const globalSettings = await globalSettingsRepo.getSettings(ctx);
            const sdoSettings: ISDOSettings | undefined = globalSettings?.settings?.sdo;
            const mapping: ISDOMapping | undefined = sdoSettings?.mapping;

            if (!mapping || !Object.keys(mapping).length) {
                return;
            }

            // Imports are off instance-wide: nothing to preserve, and the restrictive per-entity
            // default is already consistent with that.
            if (sdoSettings.importEnable === false) {
                return;
            }

            // Only fill in the entities that do not state their intent yet, so re-running the
            // migration never overwrites an `importEnable: false` set afterwards by the ops.
            const entitiesToEnable = Object.keys(mapping).filter(
                sdoLibraryId => mapping[sdoLibraryId]?.importEnable === undefined,
            );

            if (!entitiesToEnable.length) {
                return;
            }

            const migratedMapping: ISDOMapping = Object.entries(mapping).reduce(
                (acc, [sdoLibraryId, sdoLibrary]) => ({
                    ...acc,
                    [sdoLibraryId]: entitiesToEnable.includes(sdoLibraryId)
                        ? {...sdoLibrary, importEnable: true}
                        : sdoLibrary,
                }),
                {} as ISDOMapping,
            );

            // The settings upsert runs with `mergeObjects: false`: the whole document has to be
            // handed back, not just the `sdo` branch.
            await globalSettingsRepo.saveSettings({
                settings: {
                    ...globalSettings,
                    settings: {
                        ...globalSettings.settings,
                        sdo: {...sdoSettings, mapping: migratedMapping},
                    },
                },
                ctx,
            });

            logger.info(
                `[028-enableSdoImportOnMappedLibraries] SDO import enabled on ${entitiesToEnable.length} mapped ${
                    entitiesToEnable.length > 1 ? 'entities' : 'entity'
                }: ${entitiesToEnable.join(', ')}`,
            );
        },
    };
}
