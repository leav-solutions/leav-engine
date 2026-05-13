import {useRedirectToLogin} from '@leav/ui';
import {Observable} from '@apollo/client';
import {type NextLink, type Operation} from '@apollo/client/link/core';

export const useInitAuth = () => {
    const {checkAuthOrRedirectToLogin} = useRedirectToLogin();

    return {
        unauthorizedHandler: (forward: NextLink, operation: Operation) =>
            new Observable(observer => {
                (async () => {
                    try {
                        await checkAuthOrRedirectToLogin();

                        // Retry the last failed request
                        forward(operation).subscribe({
                            next: observer.next.bind(observer),
                            error: observer.error.bind(observer),
                            complete: observer.complete.bind(observer),
                        });
                    } catch (err) {
                        observer.error(err);
                    }
                })();
            }),
    };
};
