# LEAV core GraphQL — cookbook

Ready-to-use queries and mutations for the **generic, stable** part of the LEAV GraphQL API,
identical on every instance. Read the LEAV data-model guide first (apiKey, `payload`,
`SystemTranslation`, behaviors, attribute types/formats, static vs dynamic schema) — it is not
repeated here.

## GraphQL golden rules

- Do NOT introspect the schema (`__schema` / `__type`): the generic API is static and fully covered
  below. Only a library's own attributes are dynamic — discover them with the `libraries` /
  `attributes` queries (section 1).
- Always show the user the full mutation and its variables, and get explicit confirmation, before
  running a mutation.

## 1. Discover the data model

### List libraries

```graphql
query Libraries($filters: LibrariesFiltersInput) {
    libraries(filters: $filters) {
        totalCount
        list {
            id
            label
            behavior # STANDARD | DIRECTORIES | FILES | JOIN
            attributes {
                id
                type
                format
                multiple_values
                label
            }
            defaultView {
                id
            }
        }
    }
}
```

Filter by id with variables: {"filters": {"id": ["products"]}}

### List attributes

```graphql
query Attributes($filters: AttributesFiltersInput) {
    attributes(filters: $filters) {
        totalCount
        list {
            id
            type
            format
            multiple_values
            label
        }
    }
}
```

## 2. Read records

The generic 'records' query works for any library; 'library' is the library id.

```graphql
query Records($library: ID!, $filters: [RecordFilterInput], $sort: [RecordSortInput!], $pagination: RecordsPagination) {
    records(library: $library, filters: $filters, multipleSort: $sort, pagination: $pagination) {
        totalCount
        list {
            id
            whoAmI {
                id
                label
                subLabel
                color
                library {
                    id
                }
            }
            # Read several attributes' values at once:
            properties(attributeIds: ["label", "price", "category"]) {
                attributeId
                values {
                    ... on Value {
                        payload
                    } # standard attribute
                    ... on LinkValue {
                        payload {
                            id
                            whoAmI {
                                label
                            }
                        }
                    } # link attribute
                    ... on TreeValue {
                        payload {
                            id
                            record {
                                whoAmI {
                                    label
                                }
                            }
                        }
                    } # tree attribute
                }
            }
        }
    }
}
```

Variables example:

```json
{
    "library": "products",
    "filters": [{"field": "label", "condition": "CONTAINS", "value": "shirt"}],
    "sort": [{"field": "label", "order": "asc"}],
    "pagination": {"limit": 20, "offset": 0}
}
```

- **Full-text search:** pass searchQuery: "term" (with or instead of filters).
- **A single attribute:** property(attribute: "label") { ... on Value { payload } }.
- **Boolean expressions:** each RecordFilterInput may carry an 'operator' to combine filters, e.g.
  [{field, condition, value}, {operator: "OR"}, {field, condition, value}].

Filter conditions (RecordFilterCondition):
EQUAL NOT_EQUAL CONTAINS NOT_CONTAINS BEGIN_WITH END_WITH GREATER_THAN LESS_THAN IS_EMPTY
IS_NOT_EMPTY BETWEEN — dates: TODAY YESTERDAY TOMORROW NEXT_MONTH LAST_MONTH START_ON START_BEFORE
START_AFTER END_ON END_BEFORE END_AFTER — counts: VALUES_COUNT_EQUAL VALUES_COUNT_GREATER_THAN
VALUES_COUNT_LOWER_THAN — trees: CLASSIFIED_IN NOT_CLASSIFIED_IN.

Filter operators (RecordFilterOperator): AND OR OPEN_BRACKET CLOSE_BRACKET.

## 3. Read a view

Use the v1 'view' / 'views' queries. A 'viewV2' API exists but is **not stable yet** —
do not use it; this section will switch to it once it is ready.

```graphql
query View($viewId: String!) {
    view(viewId: $viewId) {
        id
        library
        label
        color
        display {
            type
            size
        }
        filters {
            field
            condition
            value
            operator
        }
        sort {
            field
            order
        }
        attributes {
            id
        }
    }
}
```

List a library's views: views(library: "products") { totalCount list { id label } }.

## 4. Create / update records

### Create a record (optionally with initial values)

```graphql
mutation CreateRecord($library: ID!, $data: CreateRecordDataInput) {
    createRecord(library: $library, data: $data) {
        record {
            id
            whoAmI {
                label
            }
        }
        valuesErrors {
            attribute
            message
        }
    }
}
```

```json
{
    "library": "products",
    "data": {
        "values": [
            {"attribute": "label", "payload": "New product"},
            {"attribute": "price", "payload": "19.99"}
        ]
    }
}
```

### Save a value on an existing record

```graphql
mutation SaveValue($library: ID!, $recordId: ID!, $attribute: ID!, $value: ValueInput!) {
    saveValue(library: $library, recordId: $recordId, attribute: $attribute, value: $value) {
        id_value
        ... on Value {
            payload
        }
    }
}
```

'value' is a ValueInput: {"payload": "..."}. For a link attribute, payload is the linked record id.
To clear a value, set payload to the literal string `__empty_value__`.

Save several attributes at once: saveValueBatch(library, recordId, values: [ValueBatchInput], deleteEmpty).

## 5. Create / update an attribute

'saveAttribute' is an upsert keyed by 'id'. See the data-model guide for `AttributeType` /
`AttributeFormat` values.

```graphql
mutation SaveAttribute($attribute: AttributeInput) {
    saveAttribute(attribute: $attribute) {
        id
        type
        format
        multiple_values
        label
    }
}
```

Standard text attribute:

```json
{
    "attribute": {
        "id": "description",
        "type": "SIMPLE",
        "format": "TEXT",
        "label": {"fr": "Description", "en": "Description"},
        "multiple_values": false
    }
}
```

- **Link** to another library: {"type": "SIMPLE_LINK", "linked_library": "categories"} (omit 'format').
- **Tree** link to a tree library: {"type": "TREE", "linked_tree": "locations"} (omit 'format').
- Multivalued attribute: add "multiple_values": true.

## 6. Create / update a library

```graphql
mutation SaveLibrary($library: LibraryInput) {
    saveLibrary(library: $library) {
        id
        label
        behavior
        attributes {
            id
        }
    }
}
```

```json
{
    "library": {
        "id": "products",
        "label": {"fr": "Produits", "en": "Products"},
        "behavior": "STANDARD",
        "attributes": ["label", "price", "description"]
    }
}
```

'attributes' is the ordered list of attribute ids attached to the library.

## GraphQL enums quick reference

(Domain enums — `LibraryBehavior`, `AttributeType`, `AttributeFormat` — are in the data-model guide.)

- SortOrder: asc desc
- RecordFilterOperator: AND OR OPEN_BRACKET CLOSE_BRACKET
