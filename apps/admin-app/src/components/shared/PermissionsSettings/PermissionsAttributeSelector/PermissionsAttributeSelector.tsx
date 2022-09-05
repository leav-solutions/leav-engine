// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLazyQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import SimplisticButton from 'components/shared/SimplisticButton';
import {getAttributesQuery} from 'queries/attributes/getAttributesQuery';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Icon} from 'semantic-ui-react';
import {GET_ATTRIBUTES, GET_ATTRIBUTESVariables, GET_ATTRIBUTES_attributes_list} from '_gqlTypes/GET_ATTRIBUTES';
import {GET_LIB_BY_ID_libraries_list} from '_gqlTypes/GET_LIB_BY_ID';
import {AttributeType} from '_gqlTypes/globalTypes';
import PermissionsAttributeSelectorList from './PermissionsAttributeSelectorList';

interface IPermissionsAttributeSelectorProps {
    library?: GET_LIB_BY_ID_libraries_list;
    selectedAttributes: string[];
    onSelectAttribute: (attribute: string) => void;
}

function PermissionsAttributeSelector({
    library,
    selectedAttributes,
    onSelectAttribute
}: IPermissionsAttributeSelectorProps): JSX.Element {
    const {t} = useTranslation();
    const [isListExpanded, setIsListExpanded] = useState(false);
    const [getAttributes, {loading, error, data, called}] = useLazyQuery<GET_ATTRIBUTES, GET_ATTRIBUTESVariables>(
        getAttributesQuery,
        {
            variables: {
                libraries: library ? [library.id] : null,
                type: [AttributeType.tree]
            }
        }
    );

    useEffect(() => {
        if (!isListExpanded || called) {
            return;
        }

        getAttributes();
    }, [isListExpanded, called]);

    const _expandList = () => {
        setIsListExpanded(true);
    };

    const _handleAttributeSelected = (attribute: GET_ATTRIBUTES_attributes_list) => {
        onSelectAttribute(attribute.id);
        setIsListExpanded(false);
    };

    const attributesList = (data?.attributes?.list ?? []).filter(
        attribute => !selectedAttributes.includes(attribute.id)
    );

    return (
        <>
            <SimplisticButton basic compact onClick={_expandList}>
                <Icon name="plus" />
                {t('permissions_settings.add_permissions_attribute')}
            </SimplisticButton>
            {loading && <Loading size="small" />}
            {error && <ErrorDisplay message={error.message} size="small" />}
            {isListExpanded && called && !loading && !error && (
                <PermissionsAttributeSelectorList attributes={attributesList} onSelect={_handleAttributeSelected} />
            )}
        </>
    );
}

export default PermissionsAttributeSelector;
