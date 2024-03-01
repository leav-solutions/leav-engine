// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ReactNode} from 'react';
import {FloatingMenu, FloatingMenuAction} from '_ui/components';
import DeleteValueBtn from '_ui/components/RecordEdition/EditRecordContent/shared/DeleteValueBtn';
import ValueDetailsBtn from '_ui/components/RecordEdition/EditRecordContent/shared/ValueDetailsBtn';
import EditRecordBtn from '_ui/components/RecordEdition/EditRecordBtn';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IRecordIdentityWhoAmI} from '_ui/types/records';
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';
import {RecordProperty} from '_ui/_queries/records/getRecordPropertiesQuery';

interface IFloatingMenuHandlerProps {
    record: IRecordIdentityWhoAmI;
    onDelete: (record: IRecordIdentityWhoAmI) => void;
    value: RecordProperty;
    attribute: RecordFormAttributeFragment;
    isReadOnly: boolean;
    children?: ReactNode;
}

function FloatingMenuHandler({
    record,
    onDelete,
    value,
    attribute,
    isReadOnly,
    children
}: IFloatingMenuHandlerProps): JSX.Element {
    const {t} = useSharedTranslation();
    const _handleDelete = () => onDelete(record);

    const menuActions: FloatingMenuAction[] = [
        {
            title: t('global.edit'),
            button: <EditRecordBtn record={record} shape="circle" />
        },
        {
            title: t('record_edition.value_details'),
            button: <ValueDetailsBtn value={value} attribute={attribute} />
        }
    ];

    if (!isReadOnly) {
        menuActions.push({
            title: t('global.delete'),
            button: <DeleteValueBtn onDelete={_handleDelete} />
        });
    }

    return (
        <div>
            {children}
            <FloatingMenu actions={menuActions} />
        </div>
    );
}

export default FloatingMenuHandler;
