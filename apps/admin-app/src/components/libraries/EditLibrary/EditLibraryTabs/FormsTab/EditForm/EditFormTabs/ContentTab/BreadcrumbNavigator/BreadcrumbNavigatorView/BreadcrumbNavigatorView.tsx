// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Breadcrumb, BreadcrumbSectionProps} from 'semantic-ui-react';
import {GET_TREE_BY_ID_trees_list} from '../../../../../../../../../../_gqlTypes/GET_TREE_BY_ID';
import {RecordIdentity_whoAmI} from '../../../../../../../../../../_gqlTypes/RecordIdentity';
import {defaultDepValue, IFormBuilderStateAndDispatch} from '../../formBuilderReducer/formBuilderReducer';
import BreadcrumbSection from './BreadcrumbSection';

interface IBreadcrumbNavigatorViewProps extends IFormBuilderStateAndDispatch {
    treeData: GET_TREE_BY_ID_trees_list;
}

function BreadcrumbNavigatorView({treeData, state, dispatch}: IBreadcrumbNavigatorViewProps): JSX.Element {
    const _getSection = (element?: RecordIdentity_whoAmI, ancestors?: RecordIdentity_whoAmI[]) => (
        <BreadcrumbSection
            key={element?.id ?? defaultDepValue}
            treeData={treeData}
            element={element}
            ancestors={ancestors}
            state={state}
            dispatch={dispatch}
        />
    );

    let breadcrumbSections: BreadcrumbSectionProps[] = [
        {
            key: defaultDepValue,
            content: _getSection(),
            link: false,
            active: false
        }
    ];

    if (state.activeDependency?.ancestors) {
        breadcrumbSections = [
            ...breadcrumbSections,
            ...state.activeDependency.ancestors.map((el, i) => ({
                key: el.id,
                content: _getSection(el, [...state.activeDependency!.ancestors].splice(0, i)),
                link: false,
                active: false
            }))
        ];
    }

    if (state.activeDependency?.value) {
        breadcrumbSections.push({
            key: state.activeDependency.value.id,
            content: _getSection(state.activeDependency.value, state.activeDependency.ancestors ?? []),
            link: false,
            active: false
        });
    }

    return <Breadcrumb sections={breadcrumbSections} icon="right angle" />;
}

export default BreadcrumbNavigatorView;
