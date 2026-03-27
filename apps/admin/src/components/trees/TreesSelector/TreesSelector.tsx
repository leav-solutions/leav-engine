// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FormDropdownProps} from 'semantic-ui-react';
import TreesSelectorField from '../TreesSelectorField';
import {type TreesFiltersInput, useGetTreesQuery} from '../../../_gqlTypes';
import {type GET_TREES_trees_list} from '../../../_gqlTypes/GET_TREES';

interface IAttributesSelectorProps extends FormDropdownProps {
    filters?: TreesFiltersInput;
}

function TreesSelector({filters, ...fieldProps}: IAttributesSelectorProps): JSX.Element {
    const {loading, data} = useGetTreesQuery({variables: {filters}});
    return (
        <TreesSelectorField
            {...fieldProps}
            loading={loading}
            trees={!!data && data.trees ? (data.trees.list as GET_TREES_trees_list[]) : []}
        />
    );
}

export default TreesSelector;
