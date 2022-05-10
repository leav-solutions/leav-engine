// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Header, List, ListItemProps} from 'semantic-ui-react';
import styled from 'styled-components';
import {PermissionTypes} from '_gqlTypes/globalTypes';
import {IGroupedPermissionsActions} from '_types/permissions';

interface IPermissionsActionsGroupSelectorProps {
    actions: IGroupedPermissionsActions;
    type: PermissionTypes;
    selectedGroup: string;
    onSelect: (selectedGroup: string) => void;
}

// Add a wrapper to avoid to pass down the "isSelected" prop to the List.Item
const ListItem = styled(({isSelected, ...rest}: {isSelected: boolean} & ListItemProps) => <List.Item {...rest} />)`
    &&&&& {
        background-color: ${props => (props.isSelected ? '#DEF4FF' : 'none')};
        text-align: left;
        margin: 0.5em 0;
        border: 1px solid #ddd;
        border-radius: 3px;

        :hover {
            background-color: ${props => (props.isSelected ? '#DEF4FF' : 'none')};
        }
    }
`;

function PermissionsActionsGroupSelector({
    actions,
    type,
    selectedGroup,
    onSelect
}: IPermissionsActionsGroupSelectorProps): JSX.Element {
    const {t} = useTranslation();

    const _handleItemClick = (groupName: string) => () => onSelect(groupName);

    return (
        <>
            <Header as="h4">{t(`permissions.type.${type}`)}</Header>
            <List selection relaxed>
                {Object.keys(actions).map(groupName => (
                    <ListItem
                        key={groupName}
                        onClick={_handleItemClick(groupName)}
                        isSelected={groupName === selectedGroup}
                    >
                        <List.Content>{t(`permissions.group.${groupName}`)}</List.Content>
                    </ListItem>
                ))}
            </List>
        </>
    );
}

export default PermissionsActionsGroupSelector;
