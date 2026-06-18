import {
    CommonAttributes,
    STATUS_TYPES_DEFAULT_VALUES,
    StatusesAttributes,
    StatusTypesAttributes,
} from '../../../_constants/systemAttributes';
import {SystemLibraries} from '../../../_constants/systemLibraries';
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

interface IDeps {
    'core.infra.db.dbService': IDbService;
    'core.infra.attribute': IAttributeRepo;
    'core.infra.library': ILibraryRepo;
}

const statusTypesAttributes: IAttributeForRepo[] = [
    {
        ...commonAttributeData,
        id: StatusTypesAttributes.LABEL,
        type: AttributeTypes.ADVANCED,
        format: AttributeFormats.TEXT,
        label: {fr: 'Libellé', en: 'Label'},
        system: true,
    },
    {
        ...commonAttributeData,
        id: StatusTypesAttributes.COLOR,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.COLOR,
        label: {fr: 'Couleur', en: 'Color'},
        system: true,
    },
    {
        ...commonAttributeData,
        id: StatusTypesAttributes.ICON,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.TEXT,
        label: {fr: 'Icône', en: 'Icon'},
        system: true,
    },
    {
        ...commonAttributeData,
        id: StatusTypesAttributes.VALUE,
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
    _key: SystemLibraries.STATUS_TYPES,
    label: {fr: 'Types de statut', en: 'Status types'},
    behavior: LibraryBehavior.STANDARD,
    attributes: [
        CommonAttributes.ID,
        CommonAttributes.CREATED_BY,
        CommonAttributes.CREATED_AT,
        CommonAttributes.MODIFIED_BY,
        CommonAttributes.MODIFIED_AT,
        CommonAttributes.ACTIVE,
        StatusTypesAttributes.LABEL,
        StatusTypesAttributes.COLOR,
        StatusTypesAttributes.ICON,
        StatusTypesAttributes.VALUE,
    ],
    system: true,
    recordIdentityConf: {label: StatusTypesAttributes.LABEL, color: StatusTypesAttributes.COLOR},
    fullTextAttributes: [StatusTypesAttributes.LABEL, StatusTypesAttributes.VALUE],
};

export default function ({
    'core.infra.db.dbService': dbService,
    'core.infra.attribute': attributeRepo,
    'core.infra.library': libraryRepo,
}: IDeps): IMigration {
    const now = dayjs().unix();

    const _createStatusTypeRecord = async (value: string, ctx: IQueryInfos) => {
        const statusTypesCollection = dbService.db.collection(SystemLibraries.STATUS_TYPES);
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
                    [StatusTypesAttributes.VALUE]: value,
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
                    attribute: StatusTypesAttributes.LABEL,
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
                id: StatusesAttributes.STATUS_TYPE,
                type: AttributeTypes.SIMPLE_LINK,
                linked_library: SystemLibraries.STATUS_TYPES,
                label: {fr: 'Type de statut', en: 'Status type'},
                values_list: {enable: true, values: statusTypeRecordIds, allowFreeEntry: false, allowListUpdate: false},
            };

            await createAttributes([statusesStatusTypeAttribute], attributeRepo, ctx);
            await linkLibraryAttributes(
                attributeRepo,
                libraryRepo,
                SystemLibraries.STATUSES,
                [statusesStatusTypeAttribute],
                ctx,
            );
        },
    };
}
