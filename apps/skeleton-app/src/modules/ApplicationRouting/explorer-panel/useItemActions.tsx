// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Explorer} from '_ui/components';
import {ComponentProps} from 'react';
import {useNavigate, generatePath} from 'react-router-dom';
import {recordSearchParamsName, routes} from '../routes';
import {FaPlus} from 'react-icons/fa';
import {useTranslation} from 'react-i18next';
import {ItemActions} from '../types';

export const useItemActions = ({actions}: {actions: ItemActions}) => {
    const {t} = useTranslation();
    const navigate = useNavigate();

    const itemActions: ComponentProps<typeof Explorer>['itemActions'] = actions.map(action => ({
        icon: <FaPlus />,
        label: t('skeleton.explore'),
        callback: item => {
            const query = new URLSearchParams({[recordSearchParamsName]: item.itemId});
            navigate(generatePath(routes.panel, {panelId: action.what.id}) + '?' + query.toString());
        }
    }));

    return {itemActions};
};
