// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useLang from 'hooks/useLang';
import React from 'react';
import {localizedLabel} from 'utils';
import {GET_ATTRIBUTE_BY_ID_attributes_list} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';

interface IAttributeLibrariesProps {
    attribute: GET_ATTRIBUTE_BY_ID_attributes_list;
}

function AttributeLibraries({attribute}: IAttributeLibrariesProps): JSX.Element {
    const {lang} = useLang();

    return <div>{(attribute?.libraries ?? []).map(l => localizedLabel(l.label, lang))}</div>;
}

export default AttributeLibraries;
