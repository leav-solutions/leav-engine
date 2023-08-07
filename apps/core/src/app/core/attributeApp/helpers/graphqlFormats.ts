// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ActionsListIOTypes, IActionsListSavedAction} from '../../../../_types/actionsList';
import {AttributeFormats} from '../../../../_types/attribute';

export const getFormatFromALConf = async (
    actions: IActionsListSavedAction[],
    {'core.domain.actionsList': actionsListDomain = null}
): Promise<string | null> => {
    // Get actions list output type if any
    const availableActions = await actionsListDomain.getAvailableActions();
    const lastActionConf = [...actions].pop();
    const lastActionSettings = availableActions.filter(al => lastActionConf.id === al.id)[0];

    if (!lastActionSettings) {
        return null;
    }

    if (lastActionSettings.output_types.length > 1) {
        return 'Any';
    } else {
        switch (lastActionSettings.output_types[0]) {
            case ActionsListIOTypes.STRING:
                return 'String';
            case ActionsListIOTypes.NUMBER:
                return 'Int';
            case ActionsListIOTypes.BOOLEAN:
                return 'Boolean';
            case ActionsListIOTypes.OBJECT:
                return 'JSONObject';
        }
    }
};

export const getFormatFromAttribute = (format: AttributeFormats): string => {
    switch (format) {
        case AttributeFormats.TEXT:
        case AttributeFormats.ENCRYPTED:
        case AttributeFormats.COLOR:
            return 'String';
        case AttributeFormats.NUMERIC:
        case AttributeFormats.DATE:
            return 'Int';
        case AttributeFormats.BOOLEAN:
            return 'Boolean';
        case AttributeFormats.EXTENDED:
            return 'JSONObject';
        case AttributeFormats.DATE_RANGE:
            return 'DateRangeValue';
        case AttributeFormats.COLOR:
            return 'String';
    }
};
