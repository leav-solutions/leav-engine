// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/react-hooks';
import React from 'react';
import {FormDropdownProps} from 'semantic-ui-react';
import {getViewsQuery} from '../../../queries/views/getViewsQuery';
import {GET_VIEWS, GET_VIEWSVariables} from '../../../_gqlTypes/GET_VIEWS';
import Loading from '../../shared/Loading';
import ViewSelectorField from './ViewSelectorField';

interface IViewSelectorProps extends FormDropdownProps {
    library: string;
}

function ViewSelector({library, ...fieldProps}: IViewSelectorProps): JSX.Element {
    const {loading, error, data} = useQuery<GET_VIEWS, GET_VIEWSVariables>(getViewsQuery, {
        variables: {
            library
        }
    });

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <div data-test-id="error">Error {error.message}</div>;
    }

    const views = data?.views?.list ?? [];

    return <ViewSelectorField views={views} {...fieldProps} />;
}

export default ViewSelector;
