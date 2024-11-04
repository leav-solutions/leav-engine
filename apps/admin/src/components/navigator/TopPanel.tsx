// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Label, Icon, Divider} from 'semantic-ui-react';

import {IListProps} from './MainPanel';
import {ActionTypes} from './NavigatorReducer';

import styles from './MainPanel.module.css';
import EditRecordModal from '../records/EditRecordModal';

export default function TopPanel({state, dispatch}: IListProps) {
    const {t} = useTranslation();
    const [createRecordOpen, setCreateRecordOpen] = useState(false);

    const {clearRoot, toggleFilters, makeOnFilterRemove, selectedRootAttributesById} = useMemo(() => ({
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
        }), [dispatch, state.selectedRootAttributes]);

    const _createNewRecord = () => {
        setCreateRecordOpen(true);
    };

    const _onCloseEditRecordModal = () => {
        setCreateRecordOpen(false);
        dispatch({
            type: ActionTypes.SET_FILTERS,
            data: state.filters
        });
    };

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

            <Button
                icon
                labelPosition="left"
                size="large"
                style={{position: 'absolute', right: '10px', top: '16px'}}
                onClick={_createNewRecord}
            >
                <Icon name="plus" />
                {t('records.create_record')}
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
            {createRecordOpen && (
                <EditRecordModal
                    open
                    onClose={_onCloseEditRecordModal}
                    library={state.selectedRoot ? state.selectedRoot : ''}
                />
            )}
        </div>
    );
}
