// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ActionsListEvents, ActionsListConfig} from '../../_types/actionsList';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';

export default (attribute: IAttribute): ActionsListConfig => {
    if (attribute.type !== AttributeTypes.SIMPLE && attribute.type !== AttributeTypes.ADVANCED) {
        return {};
    }

    let defaultActions = {};
    switch (attribute.format) {
        case AttributeFormats.NUMERIC:
            defaultActions = {
                [ActionsListEvents.SAVE_VALUE]: [
                    {
                        id: 'toNumber',
                        name: 'To Number',
                        is_system: true
                    },
                    {
                        id: 'validateFormat',
                        name: 'Validate Format',
                        is_system: true
                    }
                ],
                [ActionsListEvents.GET_VALUE]: []
            };
            break;
        case AttributeFormats.DATE:
            defaultActions = {
                [ActionsListEvents.SAVE_VALUE]: [
                    {
                        id: 'toNumber',
                        name: 'To Number',
                        is_system: true
                    },
                    {
                        id: 'validateFormat',
                        name: 'Validate Format',
                        is_system: true
                    }
                ],
                [ActionsListEvents.GET_VALUE]: [
                    {
                        id: 'formatDate',
                        name: 'Format Date',
                        is_system: false
                    }
                ]
            };
            break;
        case AttributeFormats.BOOLEAN:
            defaultActions = {
                [ActionsListEvents.SAVE_VALUE]: [
                    {
                        id: 'toBoolean',
                        name: 'To Boolean',
                        is_system: true
                    },
                    {
                        id: 'validateFormat',
                        name: 'Validate Format',
                        is_system: true
                    }
                ]
            };
            break;
        case AttributeFormats.ENCRYPTED:
            defaultActions = {
                [ActionsListEvents.SAVE_VALUE]: [
                    {
                        id: 'validateFormat',
                        name: 'Validate Format',
                        is_system: true
                    },
                    {
                        id: 'encrypt',
                        name: 'Encrypt',
                        is_system: true
                    }
                ],
                [ActionsListEvents.GET_VALUE]: [
                    {
                        id: 'toBoolean',
                        name: 'To Boolean',
                        is_system: true
                    }
                ]
            };
            break;
        case AttributeFormats.EXTENDED:
            defaultActions = {
                [ActionsListEvents.SAVE_VALUE]: [
                    {
                        id: 'parseJSON',
                        name: 'Parse JSON',
                        is_system: true
                    },
                    {
                        id: 'validateFormat',
                        name: 'Validate Format',
                        is_system: true
                    }
                ],
                [ActionsListEvents.GET_VALUE]: [
                    {
                        is_system: true,
                        id: 'toJSON',
                        name: 'To JSON'
                    }
                ]
            };
            break;
        case AttributeFormats.DATE_RANGE:
            defaultActions = {
                [ActionsListEvents.SAVE_VALUE]: [
                    {
                        id: 'parseJSON',
                        name: 'Parse JSON',
                        is_system: true
                    },
                    {
                        id: 'dateRangeToNumber',
                        name: 'dateRangeToNumber',
                        is_system: true
                    },
                    {
                        id: 'validateFormat',
                        name: 'Validate Format',
                        is_system: true
                    }
                ],
                [ActionsListEvents.GET_VALUE]: [
                    {
                        id: 'formatDateRange',
                        name: 'Format Date Range',
                        is_system: false
                    }
                ]
            };
            break;
        default:
            defaultActions = {
                [ActionsListEvents.SAVE_VALUE]: [
                    {
                        id: 'validateFormat',
                        name: 'Validate Format',
                        is_system: true
                    }
                ]
            };
            break;
    }

    return {
        [ActionsListEvents.GET_VALUE]: [],
        [ActionsListEvents.SAVE_VALUE]: [],
        [ActionsListEvents.DELETE_VALUE]: [],
        ...defaultActions
    };
};
