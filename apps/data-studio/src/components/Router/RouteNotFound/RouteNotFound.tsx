import {ErrorDisplay, ErrorDisplayTypes} from '@leav/ui';
import React from 'react';

function RouteNotFound(): JSX.Element {
    return <ErrorDisplay type={ErrorDisplayTypes.PAGE_NOT_FOUND} />;
}

export default RouteNotFound;
