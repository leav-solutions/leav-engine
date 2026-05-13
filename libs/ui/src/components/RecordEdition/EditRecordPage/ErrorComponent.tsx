import {type FunctionComponent, useEffect} from 'react';

export const ErrorComponent: FunctionComponent = () => {
    useEffect(() => {
        throw new Error();
    }, []);
    return null;
};
