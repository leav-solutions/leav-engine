// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitInput} from 'aristid-ds';
import {ComponentProps, Dispatch, DOMAttributes, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
import {
    IViewSettingsAction,
    IViewSettingsState,
    ViewSettingsActionTypes
} from './manage-view-settings/store-view-settings/viewSettingsReducer';

interface IUseSearchInputParams {
    view: IViewSettingsState;
    dispatch: Dispatch<IViewSettingsAction>;
}

export const useSearchInput = ({view, dispatch}: IUseSearchInputParams) => {
    const {t} = useSharedTranslation();
    const [search, setSearch] = useState<string>(view.fulltextSearch);

    const _handleChange: ComponentProps<typeof KitInput>['onChange'] = e => {
        if (!e.target.value) {
            setSearch('');
            dispatch({type: ViewSettingsActionTypes.CLEAR_FULLTEXT_SEARCH});
        } else {
            setSearch(e.target.value);
        }
    };

    const _handleSubmit: DOMAttributes<HTMLFormElement>['onSubmit'] = e => {
        e.preventDefault();
        dispatch({type: ViewSettingsActionTypes.CHANGE_FULLTEXT_SEARCH, payload: {search}});
    };

    return {
        searchInput: (
            <form onSubmit={_handleSubmit}>
                <KitInput
                    prefix={<FontAwesomeIcon icon={faMagnifyingGlass} />}
                    title={String(t('global.search'))}
                    placeholder={String(t('global.search'))}
                    value={search ?? ''}
                    onChange={_handleChange}
                />
            </form>
        )
    };
};