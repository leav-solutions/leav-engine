// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IUtils} from 'utils/utils';
import {IMigration} from '_types/migration';
import {IAttributeForRepo, IAttributeRepo} from '../../attribute/attributeRepo';
import {IValueRepo} from '../../value/valueRepo';
import {ILibraryRepo} from '../../library/libraryRepo';
import {IDbService} from '../dbService';
import {IConfig} from '../../../_types/config';
import {ActionsListEvents} from '../../../_types/actionsList';
import {IAttributeDomain} from '../../../domain/attribute/attributeDomain';

interface IDeps {
    config?: IConfig;
    'core.infra.db.dbService'?: IDbService;
    'core.infra.library'?: ILibraryRepo;
    'core.domain.attribute'?: IAttributeDomain;
    'core.infra.attribute'?: IAttributeRepo;
    'core.infra.value'?: IValueRepo;
    'core.utils'?: IUtils;
}

export default function ({
    config = null,
    'core.infra.attribute': attributeRepo = null,
    'core.domain.attribute': attributeDomain = null
}: IDeps = {}): IMigration {
    // prettier-ignore
    // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character:
    const PWD_REGEX = '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})';

    return {
        async run(ctx) {
            const pwdAttr = await attributeDomain.getAttributes({params: {filters: {id: 'password'}}, ctx});

            await attributeRepo.updateAttribute({
                attrData: {
                    ...(pwdAttr.list[0] as IAttributeForRepo),
                    actions_list: {
                        ...pwdAttr.list[0].actions_list,
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                id: 'validateFormat',
                                name: 'validateFormat',
                                is_system: true
                            },
                            {
                                id: 'validateRegex',
                                name: 'Validate Regex',
                                is_system: true,
                                params: [
                                    {
                                        name: 'regex',
                                        value: PWD_REGEX
                                    }
                                ]
                            },
                            {
                                id: 'encrypt',
                                name: 'encrypt',
                                is_system: true
                            }
                        ]
                    }
                },
                ctx
            });
        }
    };
}
