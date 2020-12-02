// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {TFunction} from 'i18next';
import React, {useState} from 'react';
import {Button, Confirm, Input} from 'semantic-ui-react';

interface IModalCreateEmbeddedFieldProps {
    attrId: string;
    add: (newId: string) => Promise<void>;
    t: TFunction;
}

function ModalCreateEmbeddedField({attrId, add, t}: IModalCreateEmbeddedFieldProps) {
    const [show, setShow] = useState<boolean>(false);
    const [newId, setNewId] = useState<string>('');

    const _show = () => setShow(true);
    const _close = () => setShow(false);

    const _handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewId(e.target.value);
    };

    const _add = () => {
        if (newId.length) {
            add(newId);
            _close();
            setNewId('');
        }
    };

    return (
        <>
            <Button onClick={_show} basic positive icon="plus" />
            <Confirm
                open={show}
                header={t('attributes.new_embedded_fields', {attrId})}
                content={<Input type="text" label={t('attributes.ID')} value={newId} onChange={_handleChange} />}
                confirmButton={<Button disabled={!newId.length}>{t('admin.submit')}</Button>}
                cancelButton={<Button>{t('admin.cancel')}</Button>}
                onCancel={_close}
                onConfirm={_add}
            />
        </>
    );
}

export default ModalCreateEmbeddedField;
