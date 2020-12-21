// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/react-hooks';
import React from 'react';
import {FormDropdownProps} from 'semantic-ui-react';
import {getTreesQuery} from '../../../queries/trees/getTreesQuery';
import {GET_ATTRIBUTESVariables} from '../../../_gqlTypes/GET_ATTRIBUTES';
import TreesSelectorField from '../TreesSelectorField';

interface IAttributesSelectorProps extends FormDropdownProps {
    filters?: GET_ATTRIBUTESVariables;
}

function TreesSelector({filters, ...fieldProps}: IAttributesSelectorProps): JSX.Element {
    const {loading, data} = useQuery(getTreesQuery, {variables: filters});
    return <TreesSelectorField {...fieldProps} loading={loading} trees={!!data && data.trees ? data.trees.list : []} />;
}

export default TreesSelector;
