// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {ErrorDisplayTypes} from 'components/shared/ErrorDisplay/ErrorDisplay';
import React from 'react';

function RouteNotFound(): JSX.Element {
    return <ErrorDisplay type={ErrorDisplayTypes.PAGE_NOT_FOUND} />;
}

export default RouteNotFound;
