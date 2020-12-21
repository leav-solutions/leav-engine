// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {TFunction} from 'i18next';
import React, {useState} from 'react';
import {Button, Confirm} from 'semantic-ui-react';

interface IModalRemoveEmbeddedFieldProps {
    remove: () => Promise<void>;
    t: TFunction;
}

function ModalRemoveEmbeddedField({remove, t}: IModalRemoveEmbeddedFieldProps) {
    const [show, setShow] = useState<boolean>(false);

    const _show = () => setShow(true);
    const _close = () => setShow(false);

    const _remove = () => {
        remove();
        _close();
    };

    return (
        <>
            <Button onClick={_show} basic negative icon="remove" />
            <Confirm
                open={show}
                content={t('attributes.remove_embedded_fields')}
                onCancel={_close}
                onConfirm={_remove}
                confirmButton={<Button>{t('admin.submit')}</Button>}
                cancelButton={<Button>{t('admin.cancel')}</Button>}
            />
        </>
    );
}

export default ModalRemoveEmbeddedField;
