import {
    STANDARD_FIELD_ATTRIBUTE_COLOR_ID,
    STANDARD_FIELD_ATTRIBUTE_DATE_ID,
    STANDARD_FIELD_ATTRIBUTE_DATE_RANGE_ID,
    STANDARD_FIELD_ATTRIBUTE_DROPDOWN_ID,
    STANDARD_FIELD_ATTRIBUTE_DROPDOWN_OPTION_1,
    STANDARD_FIELD_ATTRIBUTE_TEXT_ID,
    LABEL_ATTRIBUTE,
    STANDARD_FIELD_LIBRARY_ID,
    TEST_TEXT_RECORD_LABEL,
    TEST_TEXT_RECORD_INITIAL_VALUE,
    TEST_DATE_RECORD_LABEL,
    TEST_DATE_RECORD_INITIAL_VALUE,
    TEST_COLOR_RECORD_LABEL,
    TEST_COLOR_RECORD_INITIAL_VALUE,
    TEST_DATE_RANGE_RECORD_LABEL,
    TEST_DATE_RANGE_RECORD_INITIAL_VALUE,
    TEST_DROPDOWN_RECORD_LABEL,
} from './constants';

export const actions = {
    ADD: 'add',
};

export const initialData = {
    elements: [
        {
            library: STANDARD_FIELD_LIBRARY_ID,
            matches: [
                {
                    attribute: LABEL_ATTRIBUTE,
                    value: TEST_TEXT_RECORD_LABEL,
                },
            ],
            data: [
                {
                    attribute: LABEL_ATTRIBUTE,
                    values: [{payload: TEST_TEXT_RECORD_LABEL}],
                    action: actions.ADD,
                },
                {
                    attribute: STANDARD_FIELD_ATTRIBUTE_TEXT_ID,
                    values: [{payload: TEST_TEXT_RECORD_INITIAL_VALUE}],
                    action: actions.ADD,
                },
            ],
        },
        {
            library: STANDARD_FIELD_LIBRARY_ID,
            matches: [
                {
                    attribute: LABEL_ATTRIBUTE,
                    value: TEST_DATE_RECORD_LABEL,
                },
            ],
            data: [
                {
                    attribute: LABEL_ATTRIBUTE,
                    values: [{payload: TEST_DATE_RECORD_LABEL}],
                    action: actions.ADD,
                },
                {
                    attribute: STANDARD_FIELD_ATTRIBUTE_DATE_ID,
                    values: [{payload: TEST_DATE_RECORD_INITIAL_VALUE}],
                    action: actions.ADD,
                },
            ],
        },
        {
            library: STANDARD_FIELD_LIBRARY_ID,
            matches: [
                {
                    attribute: LABEL_ATTRIBUTE,
                    value: TEST_COLOR_RECORD_LABEL,
                },
            ],
            data: [
                {
                    attribute: LABEL_ATTRIBUTE,
                    values: [{payload: TEST_COLOR_RECORD_LABEL}],
                    action: actions.ADD,
                },
                {
                    attribute: STANDARD_FIELD_ATTRIBUTE_COLOR_ID,
                    values: [{payload: TEST_COLOR_RECORD_INITIAL_VALUE}],
                    action: actions.ADD,
                },
            ],
        },
        {
            library: STANDARD_FIELD_LIBRARY_ID,
            matches: [
                {
                    attribute: LABEL_ATTRIBUTE,
                    value: TEST_DATE_RANGE_RECORD_LABEL,
                },
            ],
            data: [
                {
                    attribute: LABEL_ATTRIBUTE,
                    values: [{payload: TEST_DATE_RANGE_RECORD_LABEL}],
                    action: actions.ADD,
                },
                {
                    attribute: STANDARD_FIELD_ATTRIBUTE_DATE_RANGE_ID,
                    values: [{payload: TEST_DATE_RANGE_RECORD_INITIAL_VALUE}],
                    action: actions.ADD,
                },
            ],
        },
        {
            library: STANDARD_FIELD_LIBRARY_ID,
            matches: [
                {
                    attribute: LABEL_ATTRIBUTE,
                    value: TEST_DROPDOWN_RECORD_LABEL,
                },
            ],
            data: [
                {
                    attribute: LABEL_ATTRIBUTE,
                    values: [{payload: TEST_DROPDOWN_RECORD_LABEL}],
                    action: actions.ADD,
                },
                {
                    attribute: STANDARD_FIELD_ATTRIBUTE_DROPDOWN_ID,
                    values: [{payload: STANDARD_FIELD_ATTRIBUTE_DROPDOWN_OPTION_1}],
                    action: actions.ADD,
                },
            ],
        },
    ],
    trees: [],
};
