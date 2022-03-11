// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import React from 'react';
import {getTreeByIdQuery} from '../../../../../../../../../queries/trees/getTreeById';
import {GET_FORM_forms_list_dependencyAttributes_TreeAttribute} from '../../../../../../../../../_gqlTypes/GET_FORM';
import {GET_TREE_BY_ID, GET_TREE_BY_IDVariables} from '../../../../../../../../../_gqlTypes/GET_TREE_BY_ID';
import Loading from '../../../../../../../../shared/Loading';
import {useFormBuilderReducer} from '../formBuilderReducer/hook/useFormBuilderReducer';
import BreadcrumbNavigatorView from './BreadcrumbNavigatorView';

function BreadcrumbNavigator(): JSX.Element {
    const {state, dispatch} = useFormBuilderReducer();

    // Retrieve tree ID from form config and selected attribute
    const selectedDepAttribute = state.form.dependencyAttributes?.find(
        a => a.id === state.activeDependency?.attribute
    ) as GET_FORM_forms_list_dependencyAttributes_TreeAttribute;
    const linkedTree = selectedDepAttribute.linked_tree?.id;

    // Get tree attribute props
    const {loading, error, data} = useQuery<GET_TREE_BY_ID, GET_TREE_BY_IDVariables>(getTreeByIdQuery, {
        variables: {id: linkedTree},
        skip: !linkedTree
    });

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <div className="error">ERROR {error}</div>;
    }

    if (!data?.trees?.list.length) {
        return <div className="error">CANNOT RETRIEVE TREE DATA</div>;
    }

    const treeData = data.trees.list[0];

    return <BreadcrumbNavigatorView treeData={treeData} />;
}

export default BreadcrumbNavigator;
