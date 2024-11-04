// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from 'semantic-ui-react';
import {AttributeDetails} from '../../../_gqlTypes/AttributeDetails';
import {GET_LIB_BY_ID_libraries_list} from '../../../_gqlTypes/GET_LIB_BY_ID';
import ConfirmedButton from '../../shared/ConfirmedButton';

interface IUnlinkLibAttributeProps {
    attribute?: AttributeDetails;
    library: GET_LIB_BY_ID_libraries_list | null;
    onUnlink: (attributesList: string[]) => void;
}

const UnlinkLibAttribute = (props: IUnlinkLibAttributeProps): JSX.Element => {
    const {t} = useTranslation();
    const {attribute, library, onUnlink} = props;

    if (!attribute || !library) {
        return <></>;
    }

    const label = library.label !== null ? library.label.fr || library.label.en || library.id : library.id;

    const action = () => {
        const attributesToSave = !library.attributes
            ? []
            : library.attributes.filter(a => a.id !== attribute.id).map(a => a.id);

        return onUnlink(attributesToSave);
    };

    return (
        <ConfirmedButton action={action} confirmMessage={t('libraries.confirm_unlink_attr', {libLabel: label})}>
            <Button className="unlink" circular icon="cancel" disabled={attribute.system} />
        </ConfirmedButton>
    );
};

export default UnlinkLibAttribute;
