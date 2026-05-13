import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitBreadcrumb} from 'aristid-ds';
import {type IKitBreadcrumbItem} from 'aristid-ds/dist/Kit/Navigation/Breadcrumb/types';
import {type FunctionComponent} from 'react';
import {useEditRecordReducer} from '../../editRecordReducer/useEditRecordReducer';
import {
    EditRecordReducerActionsTypes,
    EditRecordSidebarContentTypeMap,
} from '../../editRecordReducer/editRecordReducer';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';

export const Breadcrumb: FunctionComponent = () => {
    const {t} = useSharedTranslation();
    const {lang} = useLang();
    const {state, dispatch} = useEditRecordReducer();

    let items: IKitBreadcrumbItem[] = [];

    switch (state.sidebarContent) {
        case 'none':
        case 'valuesVersions':
            break;
        case 'valueDetails':
            items = [
                {
                    title: t('record_summary.entity_overview', {
                        entity: localizedTranslation(state.libraryLabel, lang),
                    }),
                    href: '',
                    onClick: e => {
                        e.preventDefault();
                        dispatch({
                            type: EditRecordReducerActionsTypes.SET_SIDEBAR_CONTENT,
                            content: EditRecordSidebarContentTypeMap.SUMMARY,
                        });
                    },
                },
                {
                    title: t('record_summary.attribute'),
                },
            ];
            break;
        default:
            items = [
                {
                    title: t('record_summary.entity_overview', {
                        entity: localizedTranslation(state.libraryLabel, lang),
                    }),
                },
            ];
            break;
    }
    return <KitBreadcrumb items={items} />;
};

export default Breadcrumb;
