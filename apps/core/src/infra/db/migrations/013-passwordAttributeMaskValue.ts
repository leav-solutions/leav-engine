import {UsersAttributes} from '../../../_constants/systemAttributes';
import {type IAttributeForRepo, type IAttributeRepo} from '../../attribute/attributeRepo';
import {type IMigration} from '../../../_types/migration';
import {type IQueryInfos} from '../../../_types/queryInfos';

interface IDeps {
    'core.infra.attribute'?: IAttributeRepo;
}

export default function ({'core.infra.attribute': attributeRepo = null}: IDeps): IMigration {
    const passwordAttributeMaskValue = async (ctx: IQueryInfos): Promise<void> => {
        const attributeFromDb = await attributeRepo.getAttributes({
            params: {
                filters: {
                    id: UsersAttributes.PASSWORD,
                },
                strictFilters: true,
                withCount: false,
            },
            ctx,
        });

        // It already exists, move on
        if (attributeFromDb.list.length === 0) {
            return;
        }

        const pwdAttribute = attributeFromDb.list[0] as IAttributeForRepo;

        if (pwdAttribute.actions_list.getValue?.[0]?.id === 'toBoolean') {
            pwdAttribute.actions_list.getValue = [
                {
                    is_system: true,
                    id: 'maskValue',
                    name: 'Mask Value',
                    params: null,
                },
            ];
            await attributeRepo.updateAttribute({
                attrData: pwdAttribute,
                ctx,
            });
            return;
        }
    };

    return {
        run: passwordAttributeMaskValue,
    };
}
