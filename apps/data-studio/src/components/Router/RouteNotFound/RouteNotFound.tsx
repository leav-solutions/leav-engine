// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorDisplay, ErrorDisplayTypes} from '@leav/ui';
import React from 'react';

function RouteNotFound(): JSX.Element {
    return <ErrorDisplay type={ErrorDisplayTypes.PAGE_NOT_FOUND} />;
}

export default RouteNotFound;
