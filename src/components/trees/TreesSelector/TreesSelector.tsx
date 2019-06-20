import React from 'react';
import {FormDropdownProps} from 'semantic-ui-react';
import {getTreesQuery, TreesQuery} from '../../../queries/trees/getTreesQuery';
import {GET_ATTRIBUTESVariables} from '../../../_gqlTypes/GET_ATTRIBUTES';
import TreesSelectorField from '../TreesSelectorField';

interface IAttributesSelectorProps extends FormDropdownProps {
    filters?: GET_ATTRIBUTESVariables;
}

function TreesSelector({filters, ...fieldProps}: IAttributesSelectorProps): JSX.Element {
    return (
        <TreesQuery query={getTreesQuery} variables={filters}>
            {({loading, error, data}) => {
                return <TreesSelectorField {...fieldProps} loading={loading} trees={!!data ? data.trees : []} />;
            }}
        </TreesQuery>
    );
}

export default TreesSelector;
