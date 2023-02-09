// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordCard, themeVars} from '@leav/ui';
import DeleteValueBtn from 'components/RecordEdition/EditRecord/shared/DeleteValueBtn';
import ValueDetailsBtn from 'components/RecordEdition/EditRecord/shared/ValueDetailsBtn';
import EditRecordBtn from 'components/RecordEdition/EditRecordBtn';
import FloatingMenu from 'components/shared/FloatingMenu';
import {FloatingMenuAction} from 'components/shared/FloatingMenu/FloatingMenu';
import {IRecordPropertyTree} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {RECORD_FORM_recordForm_elements_attribute_TreeAttribute} from '_gqlTypes/RECORD_FORM';
import {PreviewSize} from '_types/types';

interface ITreeFieldValueProps {
    value: IRecordPropertyTree;
    attribute: RECORD_FORM_recordForm_elements_attribute_TreeAttribute;
    onDelete: () => void;
    isReadOnly: boolean;
}

const ListItem = styled.div`
    padding: 0.5em 0;
    position: relative;
    &:not(:last-child) {
        border-bottom: 1px solid ${themeVars.borderColor};
    }

    &:not(:hover) .floating-menu {
        display: none;
    }

    & .floating-menu {
        right: 30px;
    }
`;

function TreeFieldValue({value, attribute, onDelete, isReadOnly}: ITreeFieldValueProps): JSX.Element {
    const {t} = useTranslation();
    const _handleDelete = async () => onDelete();

    const valueMenuActions: FloatingMenuAction[] = [
        {
            title: t('record_edition.edit_record'),
            button: <EditRecordBtn record={value.treeValue.record.whoAmI} />
        },
        {
            title: t('record_edition.value_details'),
            button: <ValueDetailsBtn value={value} attribute={attribute} />
        }
    ];

    if (!isReadOnly) {
        valueMenuActions.push({
            title: t('global.delete'),
            button: <DeleteValueBtn onDelete={_handleDelete} />
        });
    }

    return (
        <ListItem>
            <RecordCard record={value.treeValue.record.whoAmI} size={PreviewSize.small} />
            <FloatingMenu actions={valueMenuActions} />
        </ListItem>
    );
}

export default TreeFieldValue;
