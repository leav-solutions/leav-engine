export const graphqlSchemaGuideToolName = 'graphql_schema_guide' as const;

export const graphqlSchemaGuideToolDescription =
    'Returns a static cookbook of the LEAV core GraphQL API: the common queries and mutations ' +
    '(read libraries, records and views; create records, attributes and libraries; save values) ' +
    'with ready-to-use examples, variables and the key enums. ' +
    'Call this FIRST, before writing any GraphQL. It replaces schema introspection (__schema / __type) ' +
    'for the generic part of the API, which is identical on every LEAV instance. ' +
    "Only a library's own attributes are dynamic — discover those with the libraries/attributes " +
    'queries documented here, never with introspection.';

// The tool takes no input: the cookbook is static and identical for every caller. An empty
// inputSchema tells the MCP SDK to expose a tool with no arguments.
export const graphqlSchemaGuideInputSchema = {};

// Hand-written reference for the generic, stable part of the LEAV GraphQL API. It is kept here
// (rather than introspected at runtime or shipped as a separate .md) so it is bundled by tsc into
// dist/ with no extra build step, and travels with every MCP client through the handshake.
// Markdown code blocks use ~~~ fences instead of triple backticks on purpose: a backtick would
// terminate this template literal. ~~~ is valid CommonMark and reads the same to an agent.
// When the core schema changes (apps/core/src/app/core/**/*App.ts), update this file to match.
export const graphqlSchemaGuideContent = `# LEAV core GraphQL — cookbook

Reference for the **generic, stable** part of the LEAV GraphQL API. It is the same on every LEAV
instance, so you do NOT need schema introspection (__schema / __type) for any operation below.

## Golden rules

- Every graphql_query / graphql_mutation call needs the user's apiKey (it scopes permissions).
- **Static vs dynamic schema.** The operations below (libraries, records, views, attributes,
  values) are generic and never change. Only a library's *own attributes* are dynamic — discover
  them with the 'libraries' or 'attributes' query (section 1), never with introspection.
- A value's current field is **payload**. The 'value' and 'raw_value' fields are deprecated; do
  not use them.
- Translatable labels use the 'SystemTranslation' scalar: a JSON object keyed by language, e.g.
  {"fr": "Libellé", "en": "Label"}.
- Always show the user the full mutation and its variables, and get explicit confirmation, before
  calling graphql_mutation.

## 1. Discover the data model

### List libraries

~~~graphql
query Libraries($filters: LibrariesFiltersInput) {
  libraries(filters: $filters) {
    totalCount
    list {
      id
      label
      behavior                 # STANDARD | DIRECTORIES | FILES | JOIN
      attributes { id type format multiple_values label }
      defaultView { id }
    }
  }
}
~~~

Filter by id with variables: {"filters": {"id": ["products"]}}

### List attributes

~~~graphql
query Attributes($filters: AttributesFiltersInput) {
  attributes(filters: $filters) {
    totalCount
    list { id type format multiple_values label }
  }
}
~~~

## 2. Read records

The generic 'records' query works for any library; 'library' is the library id.

~~~graphql
query Records(
  $library: ID!
  $filters: [RecordFilterInput]
  $sort: [RecordSortInput!]
  $pagination: RecordsPagination
) {
  records(library: $library, filters: $filters, multipleSort: $sort, pagination: $pagination) {
    totalCount
    list {
      id
      whoAmI { id label subLabel color library { id } }
      # Read several attributes' values at once:
      properties(attributeIds: ["label", "price", "category"]) {
        attributeId
        values {
          ... on Value     { payload }                                    # standard attribute
          ... on LinkValue { payload { id whoAmI { label } } }            # link attribute
          ... on TreeValue { payload { id record { whoAmI { label } } } } # tree attribute
        }
      }
    }
  }
}
~~~

Variables example:

~~~json
{
  "library": "products",
  "filters": [{"field": "label", "condition": "CONTAINS", "value": "shirt"}],
  "sort": [{"field": "label", "order": "asc"}],
  "pagination": {"limit": 20, "offset": 0}
}
~~~

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

~~~graphql
query View($viewId: String!) {
  view(viewId: $viewId) {
    id
    library
    label
    color
    display { type size }
    filters { field condition value operator }
    sort { field order }
    attributes { id }
  }
}
~~~

List a library's views: views(library: "products") { totalCount list { id label } }.

## 4. Create / update records

### Create a record (optionally with initial values)

~~~graphql
mutation CreateRecord($library: ID!, $data: CreateRecordDataInput) {
  createRecord(library: $library, data: $data) {
    record { id whoAmI { label } }
    valuesErrors { attribute message }
  }
}
~~~

~~~json
{
  "library": "products",
  "data": {"values": [
    {"attribute": "label", "payload": "New product"},
    {"attribute": "price", "payload": "19.99"}
  ]}
}
~~~

### Save a value on an existing record

~~~graphql
mutation SaveValue($library: ID!, $recordId: ID!, $attribute: ID!, $value: ValueInput!) {
  saveValue(library: $library, recordId: $recordId, attribute: $attribute, value: $value) {
    id_value
    ... on Value { payload }
  }
}
~~~

'value' is a ValueInput: {"payload": "..."}. For a link attribute, payload is the linked record id.
To clear a value, set payload to the literal string "__empty_value__".

Save several attributes at once: saveValueBatch(library, recordId, values: [ValueBatchInput], deleteEmpty).

## 5. Create / update an attribute

'saveAttribute' is an upsert keyed by 'id'.

~~~graphql
mutation SaveAttribute($attribute: AttributeInput) {
  saveAttribute(attribute: $attribute) { id type format multiple_values label }
}
~~~

Standard text attribute:

~~~json
{"attribute": {
  "id": "description",
  "type": "SIMPLE",
  "format": "TEXT",
  "label": {"fr": "Description", "en": "Description"},
  "multiple_values": false
}}
~~~

- **Link** to another library: {"type": "SIMPLE_LINK", "linked_library": "categories"} (omit 'format').
- **Tree** link to a tree library: {"type": "TREE", "linked_tree": "locations"} (omit 'format').
- Multivalued attribute: add "multiple_values": true.

AttributeType: SIMPLE SIMPLE_LINK ADVANCED ADVANCED_LINK TREE.
AttributeFormat (SIMPLE / ADVANCED only): TEXT NUMERIC DATE DATE_RANGE BOOLEAN ENCRYPTED RICH_TEXT
COLOR EXTENDED.

## 6. Create / update a library

~~~graphql
mutation SaveLibrary($library: LibraryInput) {
  saveLibrary(library: $library) { id label behavior attributes { id } }
}
~~~

~~~json
{"library": {
  "id": "products",
  "label": {"fr": "Produits", "en": "Products"},
  "behavior": "STANDARD",
  "attributes": ["label", "price", "description"]
}}
~~~

'attributes' is the ordered list of attribute ids attached to the library.
LibraryBehavior: STANDARD DIRECTORIES FILES JOIN.

## Enums quick reference

- SortOrder: asc desc
- LibraryBehavior: STANDARD DIRECTORIES FILES JOIN
- AttributeType: SIMPLE SIMPLE_LINK ADVANCED ADVANCED_LINK TREE
- AttributeFormat: TEXT NUMERIC DATE DATE_RANGE BOOLEAN ENCRYPTED RICH_TEXT COLOR EXTENDED
- RecordFilterOperator: AND OR OPEN_BRACKET CLOSE_BRACKET
`;

// No coreUrl needed: the handler returns static content. Plain async function (not a factory like
// createGraphqlHandler) because there is nothing to inject.
export const schemaGuideHandler = async () => ({
    content: [{type: 'text' as const, text: graphqlSchemaGuideContent}],
});
