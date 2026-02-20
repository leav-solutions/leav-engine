// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IMigration} from '../../../_types/migration';
import {type IAttributeForRepo, type IAttributeRepo} from '../../attribute/attributeRepo';
import {type ILibraryRepo} from '../../library/libraryRepo';
import {commonAttributeData, createAttributes, linkLibraryAttributes} from '../helpers/libraryUtils';
import {STATUSES_ICON_ID_ATTRIBUTE_ID, STATUSES_LIBRARY_ID} from './013-threads/constants';
import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';

interface IDeps {
    'core.infra.attribute': IAttributeRepo;
    'core.infra.library': ILibraryRepo;
}

const statusIconAttribute: IAttributeForRepo = {
    ...commonAttributeData,
    id: STATUSES_ICON_ID_ATTRIBUTE_ID,
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
            await linkLibraryAttributes(attributeRepo, libraryRepo, STATUSES_LIBRARY_ID, [statusIconAttribute], ctx);
        },
    };
}
