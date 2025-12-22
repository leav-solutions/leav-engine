// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitSearchInput} from 'aristid-ds';
import {type ComponentProps, type Dispatch, type DOMAttributes, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
import {
    type IViewSettingsAction,
    type IViewSettingsState,
    ViewSettingsActionTypes,
} from './manage-view-settings/store-view-settings/viewSettingsReducer';
import {MASS_SELECTION_ALL} from './_constants';
import {type SetNewPage} from './_types';
import styled from 'styled-components';

const SearchInputStyled = styled(KitSearchInput)`
    width: 214px;
`;
/**
 * Hook used to handle a full search text in a library
 *
 * > The feature is hidden on a link entrypoint.
 *
 * @param view - represent the current view
 * @param dispatch - method to change the current view
 */
export const useSearchInput = ({
    view,
    dispatch,
    setNewPage,
}: {
    view: IViewSettingsState;
    dispatch: Dispatch<IViewSettingsAction>;
    setNewPage: SetNewPage;
}) => {
    const {t} = useSharedTranslation();
    const [search, setSearch] = useState<string>(view.fulltextSearch);

    const _handleChange: ComponentProps<typeof KitSearchInput>['onChange'] = e => {
        if (!e.target.value) {
            setSearch('');
            dispatch({type: ViewSettingsActionTypes.CLEAR_FULLTEXT_SEARCH});
            setNewPage(1, 0);
        } else {
            setSearch(e.target.value);
        }
    };

    const _handleSubmit: DOMAttributes<HTMLFormElement>['onSubmit'] = e => {
        e.preventDefault();
        e.stopPropagation();
        dispatch({type: ViewSettingsActionTypes.CHANGE_FULLTEXT_SEARCH, payload: {search}});
        setNewPage(1, 0);
    };

    return {
        searchInput:
            view.entrypoint.type === 'library' ? (
                <form onSubmit={_handleSubmit}>
                    <SearchInputStyled
                        prefix={<FontAwesomeIcon icon={faMagnifyingGlass} />}
                        title={String(t('global.search'))}
                        placeholder={String(t('global.search'))}
                        value={search ?? ''}
                        disabled={view.massSelection === MASS_SELECTION_ALL}
                        onChange={_handleChange}
                        size="middle"
                        expandable
                    />
                </form>
            ) : null,
    };
};
