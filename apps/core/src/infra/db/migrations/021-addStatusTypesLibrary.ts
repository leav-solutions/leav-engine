import {aql} from 'arangojs';
import dayjs from 'dayjs';
import {type IMigration} from '../../../_types/migration';
import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';
import {LibraryBehavior} from '../../../_types/library';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IAttributeForRepo, type IAttributeRepo} from '../../attribute/attributeRepo';
import {type IDbService} from '../dbService';
import {type ILibraryRepo} from '../../library/libraryRepo';
import {
    commonAttributeData,
    createAttributes,
    createLibraries,
    linkLibraryAttributes,
    type MigrationLibraryToCreate,
} from '../helpers/libraryUtils';
import {
    STATUS_TYPES_COLOR_ATTRIBUTE_ID,
    STATUS_TYPES_DEFAULT_VALUES,
    STATUS_TYPES_ICON_ATTRIBUTE_ID,
    STATUS_TYPES_LABEL_ATTRIBUTE_ID,
    STATUS_TYPES_LIBRARY_ID,
    STATUS_TYPES_VALUE_ATTRIBUTE_ID,
} from '../migrationConstants/statusTypes';
import {STATUSES_LIBRARY_ID, STATUSES_STATUS_TYPE_ATTRIBUTE_ID} from '../migrationConstants/statuses';

interface IDeps {
    'core.infra.db.dbService': IDbService;
    'core.infra.attribute': IAttributeRepo;
    'core.infra.library': ILibraryRepo;
}

const statusTypesAttributes: IAttributeForRepo[] = [
    {
        ...commonAttributeData,
        id: STATUS_TYPES_LABEL_ATTRIBUTE_ID,
        type: AttributeTypes.ADVANCED,
        format: AttributeFormats.TEXT,
        label: {fr: 'Libellé', en: 'Label'},
        system: true,
    },
    {
        ...commonAttributeData,
        id: STATUS_TYPES_COLOR_ATTRIBUTE_ID,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.COLOR,
        label: {fr: 'Couleur', en: 'Color'},
        system: true,
    },
    {
        ...commonAttributeData,
        id: STATUS_TYPES_ICON_ATTRIBUTE_ID,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.TEXT,
        label: {fr: 'Icône', en: 'Icon'},
        system: true,
    },
    {
        ...commonAttributeData,
        id: STATUS_TYPES_VALUE_ATTRIBUTE_ID,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.TEXT,
        label: {fr: 'Valeur', en: 'Value'},
        readonly: true,
        unique: true,
        system: true,
        values_list: {enable: true, values: STATUS_TYPES_DEFAULT_VALUES, allowFreeEntry: false, allowListUpdate: false},
    },
];

const statusTypesLibrary: MigrationLibraryToCreate = {
    _key: STATUS_TYPES_LIBRARY_ID,
    label: {fr: 'Types de statut', en: 'Status types'},
    behavior: LibraryBehavior.STANDARD,
    attributes: [
        'id',
        'created_by',
        'created_at',
        'modified_by',
        'modified_at',
        'active',
        STATUS_TYPES_LABEL_ATTRIBUTE_ID,
        STATUS_TYPES_COLOR_ATTRIBUTE_ID,
        STATUS_TYPES_ICON_ATTRIBUTE_ID,
        STATUS_TYPES_VALUE_ATTRIBUTE_ID,
    ],
    system: true,
    recordIdentityConf: {label: STATUS_TYPES_LABEL_ATTRIBUTE_ID, color: STATUS_TYPES_COLOR_ATTRIBUTE_ID},
    fullTextAttributes: [STATUS_TYPES_LABEL_ATTRIBUTE_ID, STATUS_TYPES_VALUE_ATTRIBUTE_ID],
};

export default function ({
    'core.infra.db.dbService': dbService,
    'core.infra.attribute': attributeRepo,
    'core.infra.library': libraryRepo,
}: IDeps): IMigration {
    const now = dayjs().unix();

    const _createStatusTypeRecord = async (value: string, ctx: IQueryInfos) => {
        const statusTypesCollection = dbService.db.collection(STATUS_TYPES_LIBRARY_ID);
        const valuesCollection = dbService.db.collection('core_values');
        const valuesLinksCollection = dbService.db.collection('core_edge_values_links');

        const [record] = await dbService.execute<Array<{_key: string; _id: string}>>({
            query: aql`
                INSERT ${{
                    active: true,
                    system: true,
                    created_at: now,
                    modified_at: now,
                    created_by: ctx.userId,
                    modified_by: ctx.userId,
                    [STATUS_TYPES_VALUE_ATTRIBUTE_ID]: value,
                }}
                IN ${statusTypesCollection}
                RETURN NEW
            `,
            ctx,
        });

        const [labelValue] = await dbService.execute<Array<{_id: string}>>({
            query: aql`
                INSERT ${{value}}
                IN ${valuesCollection}
                RETURN NEW
            `,
            ctx,
        });

        await dbService.execute({
            query: aql`
                INSERT ${{
                    _from: record._id,
                    _to: labelValue._id,
                    attribute: STATUS_TYPES_LABEL_ATTRIBUTE_ID,
                    created_at: now,
                    modified_at: now,
                    created_by: ctx.userId,
                    modified_by: ctx.userId,
                    version: null,
                }}
                IN ${valuesLinksCollection}
            `,
            ctx,
        });

        return record._key;
    };

    return {
        async run(ctx) {
            await createAttributes(statusTypesAttributes, attributeRepo, ctx);
            await createLibraries([statusTypesLibrary], dbService, libraryRepo, ctx);

            const statusTypeRecordIds = await Promise.all(
                STATUS_TYPES_DEFAULT_VALUES.map(value => _createStatusTypeRecord(value, ctx)),
            );

            const statusesStatusTypeAttribute: IAttributeForRepo = {
                ...commonAttributeData,
                id: STATUSES_STATUS_TYPE_ATTRIBUTE_ID,
                type: AttributeTypes.SIMPLE_LINK,
                linked_library: STATUS_TYPES_LIBRARY_ID,
                label: {fr: 'Type de statut', en: 'Status type'},
                values_list: {enable: true, values: statusTypeRecordIds, allowFreeEntry: false, allowListUpdate: false},
            };

            await createAttributes([statusesStatusTypeAttribute], attributeRepo, ctx);
            await linkLibraryAttributes(
                attributeRepo,
                libraryRepo,
                STATUSES_LIBRARY_ID,
                [statusesStatusTypeAttribute],
                ctx,
            );
        },
    };
}
