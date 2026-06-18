import {StatusesAttributes} from '../../../_constants/systemAttributes';
import {SystemLibraries} from '../../../_constants/systemLibraries';
import {type IMigration} from '../../../_types/migration';
import {type IAttributeForRepo, type IAttributeRepo} from '../../attribute/attributeRepo';
import {type ILibraryRepo} from '../../library/libraryRepo';
import {commonAttributeData, createAttributes, linkLibraryAttributes} from '../helpers/libraryUtils';
import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';

interface IDeps {
    'core.infra.attribute': IAttributeRepo;
    'core.infra.library': ILibraryRepo;
}

const statusIconAttribute: IAttributeForRepo = {
    ...commonAttributeData,
    id: StatusesAttributes.ICON_ID,
    type: AttributeTypes.SIMPLE,
    format: AttributeFormats.TEXT,
    label: {fr: 'Icône du statut', en: 'Status icon'},
    system: false,
};

export default function ({
    'core.infra.attribute': attributeRepo,
    'core.infra.library': libraryRepo,
}: IDeps): IMigration {
    return {
        async run(ctx) {
            await createAttributes([statusIconAttribute], attributeRepo, ctx);
            await linkLibraryAttributes(
                attributeRepo,
                libraryRepo,
                SystemLibraries.STATUSES,
                [statusIconAttribute],
                ctx,
            );
        },
    };
}
