import {ErrorDisplay, ErrorDisplayTypes} from '@leav/ui';

function RouteNotFound(): JSX.Element {
    return <ErrorDisplay type={ErrorDisplayTypes.PAGE_NOT_FOUND} />;
}

export default RouteNotFound;
