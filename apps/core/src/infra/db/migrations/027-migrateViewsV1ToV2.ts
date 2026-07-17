import {aql} from 'arangojs';
import {type ILogger} from '@leav/logger';
import {type IMigration} from '../../../_types/migration';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type SortOrder} from '../../../_types/list';
import {type AttributeCondition, TreeCondition} from '../../../_types/record';
import {type IConfig} from '../../../_types/config';
import {type ISystemTranslation} from '../../../_types/systemTranslation';
import {type IView} from '../../../_types/views';
import {ViewV2Shortcut, ViewV2Types, type IViewV2Filter, type IViewV2Sort} from '../../../_types/viewsV2';
import {type IDbService} from '../dbService';
import {type IDbUtils} from '../dbUtils';
import {VIEWS_COLLECTION_NAME} from '../../view/_types';
import {type IViewV2CreateInRepo, type IViewV2Repo, VIEWS_V2_COLLECTION_NAME} from '../../viewV2/viewV2Repo';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.viewV2'?: IViewV2Repo;
    'core.utils.logger'?: ILogger;
    config?: IConfig;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.infra.viewV2': viewV2Repo = null,
    'core.utils.logger': logger = null,
    config = null,
}: IDeps = {}): IMigration {
    /**
     * Map a single V1 view to the V2 repo create payload. Returns `null` (and logs) when the view
     * can't be represented in V2 (missing `library`, which is mandatory).
     */
    const _mapV1ToV2 = (v1: IView): IViewV2CreateInRepo | null => {
        if (!v1.library) {
            logger.warn(`[027-migrateViewsV1ToV2] Skipping view ${v1.id}: missing library`);
            return null;
        }

        // V1 filters mix real attribute/tree conditions with purely logical entries (AND/OR
        // operators, parentheses) that have no `field`. The latter are not representable in V2
        // (no valid `attributes`) so we skip them.
        const filters: IViewV2Filter[] = (v1.filters ?? [])
            .filter(f => f.field && f.condition)
            .map(f => ({
                pinned: true,
                attributes: [f.field],
                // Mirror the front save path (getUIFilterValues in useViewFiltersConverter):
                // a set value → [value], no value → [] (never [null]).
                values: f.value !== null && f.value !== undefined ? [f.value] : [],
                // ViewV2Filter.condition accepts both attribute and tree conditions; best-effort
                // for tree filters (treeId/CLASSIFIED_IN) — flag them for manual re-check.
                condition: f.condition as AttributeCondition | TreeCondition,
                // V1 has no equivalent; default to false like a freshly-saved V2 filter.
                withEmptyValues: false,
            }));

        v1.filters
            ?.filter(f => f.treeId || f.condition === TreeCondition.CLASSIFIED_IN)
            .forEach(f =>
                logger.warn(
                    `[027-migrateViewsV1ToV2] View ${v1.id}: tree filter mapped best-effort (field=${f.field}, treeId=${f.treeId}), re-check needed`,
                ),
            );

        const sorts: IViewV2Sort[] = (v1.sort ?? []).map(s => ({
            activated: true,
            attributes: [s.field],
            order: s.order as SortOrder,
        }));

        const shortcuts: ViewV2Shortcut[] = [ViewV2Shortcut.DISPLAY, ViewV2Shortcut.CATALOG];
        if (filters.length > 0) {
            shortcuts.push(ViewV2Shortcut.FILTERS);
        }
        if (sorts.length > 0) {
            shortcuts.push(ViewV2Shortcut.SORTS);
        }

        // `ICoreEntity.label` is `ISystemTranslation | string`; V2 only accepts the translation map.
        // Object label → kept as-is; bare string → replicated across every available language;
        // otherwise fall back to the (already-translated) description, else empty.
        let label: ISystemTranslation;
        if (v1.label && typeof v1.label === 'object') {
            label = v1.label;
        } else if (typeof v1.label === 'string') {
            const labelStr = v1.label;
            label = Object.fromEntries(config.lang.available.map(lang => [lang, labelStr]));
        } else {
            const labelStr = v1.id;
            label = Object.fromEntries(config.lang.available.map(lang => [lang, labelStr]));
        }

        return {
            library: v1.library,
            label,
            display: {
                // ViewTypes and ViewV2Types share the same values (list/cards/timeline).
                type: (v1.display?.type as unknown as ViewV2Types) ?? ViewV2Types.LIST,
                attributes: (v1.attributes ?? []).map(attributeId => ({attributeId, visible: true})),
            },
            shared: v1.shared ?? false,
            filters,
            sorts,
            shortcuts,
            valuesVersions: v1.valuesVersions ?? null,
            created_by: v1.created_by,
            created_at: v1.created_at ?? Date.now(),
            modified_at: Date.now(),
            sourceViewId: v1.id,
            // `id` is intentionally left undefined: ArangoDB generates the `_key`. The link back to
            // the V1 view is carried by `sourceViewId`, not by the key.
            // `origin` is intentionally left undefined: these are regular explorer views.
        };
    };

    return {
        async run(ctx: IQueryInfos) {
            const viewsV2Col = dbService.db.collection(VIEWS_V2_COLLECTION_NAME);
            const viewsV1Col = dbService.db.collection(VIEWS_COLLECTION_NAME);

            // 1. Purge previously-migrated V2 views so the migration is re-runnable / auto-idempotent.
            const purged = await dbService.execute({
                query: aql`
                    FOR v IN ${viewsV2Col}
                        FILTER v.sourceViewId != null
                        REMOVE v IN ${viewsV2Col}
                        RETURN OLD
                `,
                ctx,
            });

            // 2. Read every V1 view (all owners) — viewRepo.getViews filters by created_by/shared
            // so it can't be used here.
            const v1Docs = await dbService.execute({
                query: aql`FOR v IN ${viewsV1Col} RETURN v`,
                ctx,
            });

            // 3 & 4. Map and insert.
            let migrated = 0;
            let skipped = 0;
            for (const doc of v1Docs) {
                const v1: IView = dbUtils.cleanup(doc);
                const payload = _mapV1ToV2(v1);

                if (!payload) {
                    skipped++;
                    continue;
                }

                await viewV2Repo.createViewV2(payload, ctx);
                migrated++;
            }

            // 5. Final report.
            logger.info(
                `[027-migrateViewsV1ToV2] Purged ${purged.length} previously-migrated V2 view(s), migrated ${migrated}, skipped ${skipped}`,
            );
        },
    };
}
