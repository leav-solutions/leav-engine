// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitBreadcrumb} from 'aristid-ds';
import {IKitBreadcrumbItem} from 'aristid-ds/dist/Kit/Navigation/Breadcrumb/types';
import {FunctionComponent} from 'react';
import {useEditRecordReducer} from '../../editRecordReducer/useEditRecordReducer';
import {EditRecordReducerActionsTypes} from '../../editRecordReducer/editRecordReducer';
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
                        entity: localizedTranslation(state.libraryLabel, lang)
                    }),
                    href: '',
                    onClick: e => {
                        e.preventDefault();
                        dispatch({
                            type: EditRecordReducerActionsTypes.SET_SIDEBAR_CONTENT,
                            content: 'summary'
                        });
                    }
                },
                {
                    title: t('record_summary.attribute')
                }
            ];
            break;
        default:
            items = [
                {
                    title: t('record_summary.entity_overview', {
                        entity: localizedTranslation(state.libraryLabel, lang)
                    })
                }
            ];
            break;
    }
    return <KitBreadcrumb items={items} />;
};

export default Breadcrumb;
