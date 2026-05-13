import {gql} from '@apollo/client';

export const getUploadUpdates = gql`
    subscription UPLOAD_UPDATE($filters: UploadFiltersInput) {
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
