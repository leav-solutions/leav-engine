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
