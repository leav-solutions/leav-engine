import {gql} from '@apollo/client';

export const importExcel = gql`
    mutation IMPORT_EXCEL($file: Upload!, $sheets: [SheetInput], $startAt: Int) {
        importExcel(file: $file, sheets: $sheets, startAt: $startAt)
    }
`;
