// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitButton, KitDivider, KitInput, KitSelect, KitSpace} from 'aristid-ds';
import {FunctionComponent} from 'react';
import {FaCheck, FaClock, FaTrash} from 'react-icons/fa';
import {useViewSettingsContext} from '../../store-view-settings/useViewSettingsContext';
import {ViewSettingsActionTypes} from '../../store-view-settings/viewSettingsReducer';
import styled from 'styled-components';

// TODO : This is an exemple file showing ho to customize dropdown Panel content. Don't mind the content of the file, missing types,... it's just an example.

const operators = [
    {
        label: 'Egal à',
        value: 'eq'
    },
    {
        label: 'Différent de',
        value: 'neq'
    },
    {
        label: 'Commence par',
        value: 'start'
    },
    {
        label: 'Contient',
        value: 'contains'
    },
    {
        label: 'Ne contient pas',
        value: 'not_contains'
    },
    {
        label: 'Est dans la liste',
        value: 'in'
    },
    {
        label: "N'est pas dans la liste",
        value: 'not_in'
    }
];

const attributeValuesList = ['Value 1', 'Value 2', 'Value 3', 'Value 4', 'Value 5'];

const ValueListItemValueLi = styled.li`
    display: flex;
    align-items: center;
    min-height: 32px;
    height: 32px;
    border-radius: calc(var(--general-border-radius-s) * 1px);
    cursor: pointer;

    &.selected {
        color: var(--components-Icon-colors-icon-on, var(--general-utilities-main-default));
        background-color: var(--components-Icon-colors-background-on, var(--general-utilities-main-light));
    }

    .label {
        flex: 1;
        padding: 0 calc(var(--general-spacing-xs) * 1px);
    }

    .check {
        flex: 0;
        padding: 0 calc(var(--general-spacing-xs) * 1px);
    }
`;

export const SimpleFilterDropdown: FunctionComponent<{
    filter: {
        field: string;
        operator: string;
        values: string[];
    };
    attribute: {multiple_values: boolean};
}> = ({filter, attribute}) => {
    const {t} = useSharedTranslation();
    const {dispatch} = useViewSettingsContext();

    const updateFilter = data => {
        dispatch({
            type: ViewSettingsActionTypes.CHANGE_FILTER_CONFIG,
            payload: {
                field: filter.field,
                operator: data.operator,
                values: data.values
            }
        });
    };

    const onOperatorChanged = operator => {
        updateFilter({...filter, operator});
    };

    const onValueClick = value => {
        let newValues = [...filter.values];
        if (filter.values.includes(value)) {
            newValues = filter.values.filter(v => v !== value);
        } else {
            if (attribute.multiple_values) {
                newValues = [...filter.values, value];
            } else {
                newValues = [value];
            }
        }
        updateFilter({...filter, values: newValues});
    };

    return (
        <KitSpace size="xxs" direction="vertical">
            <KitSelect options={operators} onChange={onOperatorChanged} value={filter.operator} />
            <KitInput placeholder={String(t('search'))} />
            <ul>
                {attributeValuesList.map(value => (
                    <ValueListItemValueLi
                        key={value}
                        onClick={() => onValueClick(value)}
                        className={filter.values.includes(value) ? 'selected' : ''}
                    >
                        <span className="label">{value}</span>
                        {filter.values.includes(value) && (
                            <span className="check">
                                <FaCheck />
                            </span>
                        )}
                    </ValueListItemValueLi>
                ))}
            </ul>
            <KitDivider noMargin />
            <KitButton type="link" icon={<FaClock />}>
                Réinitialiser le filtre
            </KitButton>
            <KitButton type="link" icon={<FaTrash />}>
                Supprimer
            </KitButton>
        </KitSpace>
    );
};
