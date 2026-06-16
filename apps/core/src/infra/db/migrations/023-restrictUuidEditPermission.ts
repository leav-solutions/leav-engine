import {CommonAttributes} from '../../../_constants/systemAttributes';
import {type IMigration} from '../../../_types/migration';
import {type IPermissionRepo} from '../../permission/permissionRepo';
import {AttributePermissionsActions, PermissionTypes} from '../../../_types/permissions';
import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';
import {ActionsListEvents} from '../../../_types/actionsList';
import {type IAttributeRepo} from '../../attribute/attributeRepo';

interface IDeps {
    'core.infra.attribute': IAttributeRepo;
    'core.infra.permission': IPermissionRepo;
}

export default function ({
    'core.infra.attribute': attributeRepo,
    'core.infra.permission': permissionRepo,
}: IDeps): IMigration {
    return {
        async run(ctx) {
            // Restrict edit permission on the uuid attribute for all users
            // Only admin can edit it if needed (not recommended), for user import for instance
            await permissionRepo.savePermission({
                permData: {
                    type: PermissionTypes.ATTRIBUTE,
                    applyTo: CommonAttributes.UUID,
                    actions: {
                        [AttributePermissionsActions.EDIT_VALUE]: false,
                    },
                    usersGroup: null,
                    permissionTreeTarget: null,
                },
                ctx,
            });

            // Add save value regex uuid validation
            await attributeRepo.updateAttribute({
                attrData: {
                    id: CommonAttributes.UUID,
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                    system: true,
                    readonly: true,
                    required: false,
                    multiple_values: false,
                    versions_conf: {versionable: false},
                    label: {fr: 'UUID', en: 'UUID'},
                    description: {
                        fr: 'Identifiant universel cross-application',
                        en: 'Cross-application universal identifier',
                    },
                    actions_list: {
                        [ActionsListEvents.GET_VALUE]: [],
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                id: 'validateFormat',
                                name: 'Validate Format',
                                is_system: true,
                            },
                            {
                                id: 'validateRegex',
                                name: 'Validate Regex',
                                params: [
                                    {
                                        name: 'regex',
                                        value: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
                                    },
                                ],
                            },
                        ],
                        [ActionsListEvents.DELETE_VALUE]: [],
                    },
                },
                ctx,
            });
        },
    };
}
