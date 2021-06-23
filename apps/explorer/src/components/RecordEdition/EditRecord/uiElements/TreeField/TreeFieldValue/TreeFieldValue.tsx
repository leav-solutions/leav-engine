// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {BranchesOutlined, InfoCircleOutlined} from '@ant-design/icons';
import {Button, Popover} from 'antd';
import DeleteValueBtn from 'components/RecordEdition/EditRecord/shared/DeleteValueBtn';
import EditRecordBtn from 'components/RecordEdition/EditRecordBtn';
import FloatingMenu from 'components/shared/FloatingMenu';
import {FloatingMenuAction} from 'components/shared/FloatingMenu/FloatingMenu';
import {IRecordPropertyTree} from 'graphQL/queries/records/getRecordPropertiesQuery';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {GET_FORM_forms_list_elements_elements_attribute} from '_gqlTypes/GET_FORM';
import ValueDetails from '../../../shared/ValueDetails';
import PathsList from '../PathsList';

interface ITreeFieldValueProps {
    value: IRecordPropertyTree;
    attribute: GET_FORM_forms_list_elements_elements_attribute;
    onDelete: () => void;
}

const ListItem = styled.div`
    position: relative;
    &:not(:last-child) {
        border-bottom: 1px solid ${themingVar['@border-color-base']};
    }

    &:not(:hover) .floating-menu {
        display: none;
    }

    & .floating-menu {
        right: 30px;
    }
`;

function TreeFieldValue({value, attribute, onDelete}: ITreeFieldValueProps): JSX.Element {
    const {t} = useTranslation();
    const _handleDelete = async () => onDelete();
    const [displayAllPaths, setDisplayAllPaths] = useState<boolean>(false);

    const valueMenuActions: FloatingMenuAction[] = [
        {
            title: t('record_edition.edit_record'),
            button: <EditRecordBtn record={value.treeValue.record.whoAmI} size="small" />
        },
        {
            title: t('record_edition.value_details'),
            button: (
                <Popover
                    overlayStyle={{maxWidth: '50vw'}}
                    placement="topLeft"
                    content={<ValueDetails value={value} attribute={attribute} />}
                    trigger="click"
                >
                    <Button icon={<InfoCircleOutlined />} size="small" />
                </Popover>
            )
        },
        {
            title: t('global.delete'),
            button: <DeleteValueBtn onDelete={_handleDelete} />
        }
    ];

    if (value.treeValue.ancestors.length > 1) {
        valueMenuActions.splice(2, 0, {
            title: t('record_edition.other_paths'),
            size: 'small',
            icon: <BranchesOutlined />,
            onClick: () => setDisplayAllPaths(!displayAllPaths)
        });
    }

    const pathsToDisplay = displayAllPaths ? value.treeValue.ancestors : value.treeValue.ancestors.slice(0, 1);

    return (
        <ListItem>
            <PathsList paths={pathsToDisplay} />
            <FloatingMenu actions={valueMenuActions} />
        </ListItem>
    );
}

export default TreeFieldValue;
