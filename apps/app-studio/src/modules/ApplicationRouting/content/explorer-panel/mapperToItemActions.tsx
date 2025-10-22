// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps} from 'react';
import {type Explorer} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {generatePath, type NavigateFunction} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {type IconProp} from '@fortawesome/fontawesome-svg-core';
import {type Application, type ItemActions} from '../../types';
import {RelativePaths} from '../../router/paths';

export const mapperToItemActions = ({
    actions,
    application,
    lang,
    navigate,
    libraryId
}: {
    actions: ItemActions;
    application: Application;
    lang: string[];
    navigate: NavigateFunction;
    libraryId: string;
}): ComponentProps<typeof Explorer>['itemActions'] =>
    actions.map(action => {
        // As suggested by FontAwesome documentation, we need this workaround to use the string notation
        // More info: https://docs.fontawesome.com/web/use-with/react/add-icons#workaround
        // @ts-expect-error: Type 'string' is not assignable to type 'IconProp'
        const icon: IconProp = `fa-solid ${action.icon ? action.icon : 'fa-star-of-life'}`;

        return {
            icon: <FontAwesomeIcon icon={icon} />,
            label: localizedTranslation(action.label, lang),
            useItemActionOnRowClick: action.onRowClick,
            callback: item =>
                navigate(
                    generatePath(RelativePaths.nextLevelPanel, {
                        recordId: item.itemId,
                        where: action.where,
                        recordPanelId: application.libraries[libraryId].recordPanels[0].id
                    })
                )
        };
    });
