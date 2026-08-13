import ErrorDisplay from '../../../../../../../../shared/ErrorDisplay';
import {type GET_FORM_forms_list_dependencyAttributes_TreeAttribute} from '../../../../../../../../../_gqlTypes/GET_FORM';
import Loading from '../../../../../../../../shared/Loading';
import {useFormBuilderReducer} from '../formBuilderReducer/hook/useFormBuilderReducer';
import BreadcrumbNavigatorView from './BreadcrumbNavigatorView';
import {useGetTreeByIdQuery} from '../../../../../../../../../_gqlTypes';
import {type GET_TREE_BY_ID_trees_list} from '../../../../../../../../../_gqlTypes/GET_TREE_BY_ID';

function BreadcrumbNavigator(): JSX.Element {
    const {state} = useFormBuilderReducer();

    // Retrieve tree ID from form config and selected attribute
    const selectedDepAttribute = state.form.dependencyAttributes?.find(
        a => a.id === state.activeDependency?.attribute,
    ) as GET_FORM_forms_list_dependencyAttributes_TreeAttribute;
    const linkedTree = selectedDepAttribute.linked_tree?.id;

    // Get tree attribute props
    const {loading, error, data} = useGetTreeByIdQuery({
        variables: {id: [linkedTree]},
        skip: !linkedTree,
    });

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    if (!data?.trees?.list.length) {
        return <ErrorDisplay />;
    }

    const treeData = data.trees.list[0];

    return <BreadcrumbNavigatorView treeData={treeData as GET_TREE_BY_ID_trees_list} />;
}

export default BreadcrumbNavigator;
