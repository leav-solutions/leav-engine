// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import styled from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import {FloatingMenu, FloatingMenuAction, RecordCard} from '_ui/components';
import DeleteValueBtn from '_ui/components/RecordEdition/EditRecord/shared/DeleteValueBtn';
import ValueDetailsBtn from '_ui/components/RecordEdition/EditRecord/shared/ValueDetailsBtn';
import EditRecordBtn from '_ui/components/RecordEdition/EditRecordBtn';
import {PreviewSize} from '_ui/constants';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {RecordFormAttributeTreeAttributeFragment} from '_ui/_gqlTypes';
import {IRecordPropertyTree} from '_ui/_queries/records/getRecordPropertiesQuery';

interface ITreeFieldValueProps {
    value: IRecordPropertyTree;
    attribute: RecordFormAttributeTreeAttributeFragment;
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
    const {t} = useSharedTranslation();
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
