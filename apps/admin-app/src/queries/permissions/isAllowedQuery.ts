// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Query} from '@apollo/react-components';
import gql from 'graphql-tag';
import {IS_ALLOWED, IS_ALLOWEDVariables} from '../../_gqlTypes/IS_ALLOWED';

export const isAllowedQuery = gql`
    query IS_ALLOWED(
        $type: PermissionTypes!
        $applyTo: ID
        $actions: [PermissionsActions!]!
        $target: PermissionTarget
    ) {
        isAllowed(type: $type, actions: $actions, applyTo: $applyTo, target: $target) {
            name
            allowed
        }
    }
`;

export const IsAllowedQuery = p => Query<IS_ALLOWED, IS_ALLOWEDVariables>(p);
