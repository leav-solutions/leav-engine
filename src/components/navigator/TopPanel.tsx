import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Label, Icon, Divider} from 'semantic-ui-react';

import {IListProps} from './MainPanel';
import {ActionTypes} from './NavigatorReducer';

import styles from './MainPanel.module.css';

export default function TopPanel({state, dispatch}: IListProps) {
    const {t} = useTranslation();
    const {clearRoot, toggleFilters, makeOnFilterRemove, selectedRootAttributesById} = useMemo(() => {
        return {
            clearRoot: () => {
                dispatch({
                    type: ActionTypes.SET_SELECTED_ROOT,
                    data: null
                });
            },
            toggleFilters: () => {
                dispatch({
                    type: ActionTypes.TOGGLE_FILTERS,
                    data: null
                });
            },
            makeOnFilterRemove: i => e => {
                e.stopPropagation();
                dispatch({
                    type: ActionTypes.FILTER_REMOVE,
                    data: i
                });
                return false;
            },
            selectedRootAttributesById: state.selectedRootAttributes.reduce((acc, a) => {
                acc[a.id] = a;
                return acc;
            }, {})
        };
    }, [dispatch, state.selectedRootAttributes]);

    return (
        <div className={`ui block segment secondary height100 ${styles.TopPanelHeader}`}>
            <h3>
                {state.restrictToRoots.length !== 1 && (
                    <Button size="tiny" compact circular data-testid="clear_root" onClick={clearRoot} icon="random" />
                )}
                <i className="book icon" />
                {state.selectedRootLabel}
            </h3>
            <Button size="small" data-testid="toggle_filters" onClick={toggleFilters}>
                <Icon name="edit" />
                {t('navigator.edit_filters')}
            </Button>
            <Divider />

            <Label.Group onClick={toggleFilters} color="blue">
                {state.filters.map((f, i) => (
                    <Label as="span" image key={i}>
                        {`${selectedRootAttributesById[f.attribute].label[state.lang[0]]} ${f.operator} ${f.value}`}
                        <Label.Detail>
                            <Icon name="delete" onClick={makeOnFilterRemove(i)} />
                        </Label.Detail>
                    </Label>
                ))}
            </Label.Group>
        </div>
    );
}
