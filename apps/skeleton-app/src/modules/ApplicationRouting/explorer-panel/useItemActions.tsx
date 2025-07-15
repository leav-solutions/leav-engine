// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Explorer, useLang} from '@leav/ui';
import {ComponentProps} from 'react';
import {useNavigate, generatePath, useParams} from 'react-router-dom';
import {FaPlus} from 'react-icons/fa';
import {recordSearchParamsName, routes} from '../routes';
import {ItemActions} from '../types';
import {localizedTranslation} from '@leav/utils';

export const useItemActions = ({actions}: {actions: ItemActions}) => {
    const {lang} = useLang();
    const navigate = useNavigate();
    const params = useParams();

    const itemActions: ComponentProps<typeof Explorer>['itemActions'] = actions.map(action => ({
        icon: <FaPlus />,
        label: localizedTranslation(action.what.name, lang),
        callback: item => {
            const query = new URLSearchParams({[recordSearchParamsName]: item.itemId});

            //TODO: Ajouter la query uniquement si nécessaire ?
            if (action.where === 'popup') {
                return navigate(
                    generatePath(routes.popupPanel, {panelId: params.panelId, popupPanelId: action.what.id}) +
                        '?' +
                        query.toString()
                );
            }

            if (action.where === 'slider') {
                return;
            }

            return navigate(generatePath(routes.panel, {panelId: action.what.id}) + '?' + query.toString());
        }
    }));

    return {itemActions};
};
