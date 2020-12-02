// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/react-hooks';
import React from 'react';
import {getTreesQuery} from '../../../../../../../../../queries/trees/getTreesQuery';
import {GET_FORM_forms_list_dependencyAttributes_TreeAttribute} from '../../../../../../../../../_gqlTypes/GET_FORM';
import {GET_TREES, GET_TREESVariables} from '../../../../../../../../../_gqlTypes/GET_TREES';
import Loading from '../../../../../../../../shared/Loading';
import {IFormBuilderStateAndDispatch} from '../formBuilderReducer/formBuilderReducer';
import BreadcrumbNavigatorView from './BreadcrumbNavigatorView';

function BreadcrumbNavigator({state, dispatch}: IFormBuilderStateAndDispatch): JSX.Element {
    // Retrieve tree ID from form config and selected attribute
    const selectedDepAttribute = state.form.dependencyAttributes?.find(
        a => a.id === state.activeDependency?.attribute
    ) as GET_FORM_forms_list_dependencyAttributes_TreeAttribute;
    const linkedTree = selectedDepAttribute.linked_tree;

    // Get tree attribute props
    const {loading, error, data} = useQuery<GET_TREES, GET_TREESVariables>(getTreesQuery, {
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

    return <BreadcrumbNavigatorView treeData={treeData} state={state} dispatch={dispatch} />;
}

export default BreadcrumbNavigator;
