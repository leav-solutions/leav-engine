// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useRedirectToLogin} from '@leav/ui';
import {Observable} from '@apollo/client';
import type {NextLink, Operation} from '@apollo/client/link/core';

export const useInitAuth = () => {
    const {redirectToLogin} = useRedirectToLogin();

    return {
        unauthorizedHandler: (forward: NextLink, operation: Operation) =>
            new Observable(observer => {
                (async () => {
                    try {
                        redirectToLogin();

                        // Retry the last failed request
                        forward(operation).subscribe({
                            next: observer.next.bind(observer),
                            error: observer.error.bind(observer),
                            complete: observer.complete.bind(observer)
                        });
                    } catch (err) {
                        observer.error(err);
                    }
                })();
            })
    };
};
