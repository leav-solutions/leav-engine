// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const getUploadUpdates = gql`
    subscription SUB_UPLOAD_UPDATE($filters: UploadFiltersInput) {
        upload(filters: $filters) {
            userId
            progress {
                length
                transferred
                speed
                runtime
                remaining
                percentage
                eta
                delta
            }
            uid
        }
    }
`;
