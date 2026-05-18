# Export Profile Configuration

## Overview

Export Profiles allow you to define reusable column configurations for exporting library data. Each profile specifies
which attributes to export and how to label them in the exported file.

## Configuration Location

Export profiles are configured in the library settings under the `export` key:

```json
{
    "export": {
        "defaultProfile": "Default Export",
        "profiles": [
            {
                "label": "Default Export",
                "columns": [
                    {
                        "columnLabel": "Product Name",
                        "attribute": "product_name"
                    },
                    {
                        "columnLabel": "SKU",
                        "attribute": "product_sku"
                    },
                    {
                        "columnLabel": "Price",
                        "attribute": "product_price"
                    }
                ]
            }
        ]
    }
}
```

## Configuration Structure

### Export Config Object

| Field            | Type   | Required | Description                            |
| ---------------- | ------ | -------- | -------------------------------------- |
| `defaultProfile` | string | Yes      | Label of the profile to use by default |
| `profiles`       | array  | Yes      | Array of profile objects (minimum 1)   |

### Profile Object

| Field     | Type   | Required | Description                         |
| --------- | ------ | -------- | ----------------------------------- |
| `label`   | string | Yes      | Display name for the profile        |
| `columns` | array  | Yes      | Array of column objects (minimum 1) |

### Column Object

| Field         | Type   | Required | Description                                                           |
| ------------- | ------ | -------- | --------------------------------------------------------------------- |
| `columnLabel` | string | Yes      | Header label for the column in the export (can be null or empty)      |
| `attribute`   | string | Yes      | Attribute ID to export (can be null or empty for placeholder columns) |

## Examples

### Basic Export Profile

```json
{
    "defaultProfile": "Basic Info",
    "profiles": [
        {
            "label": "Basic Info",
            "columns": [
                {
                    "columnLabel": "ID",
                    "attribute": "id"
                },
                {
                    "columnLabel": "Name",
                    "attribute": "name"
                },
                {
                    "columnLabel": "Email",
                    "attribute": "email"
                }
            ]
        }
    ]
}
```

### Multiple Profiles

```json
{
    "defaultProfile": "Full Export",
    "profiles": [
        {
            "label": "Full Export",
            "columns": [
                {
                    "columnLabel": "Name",
                    "attribute": "name"
                },
                {
                    "columnLabel": "Email",
                    "attribute": "email"
                },
                {
                    "columnLabel": "Phone",
                    "attribute": "phone"
                },
                {
                    "columnLabel": "Address",
                    "attribute": "address"
                }
            ]
        },
        {
            "label": "Minimal Export",
            "columns": [
                {
                    "columnLabel": "Name",
                    "attribute": "name"
                },
                {
                    "columnLabel": "Email",
                    "attribute": "email"
                }
            ]
        }
    ]
}
```

### With Empty Placeholder Columns

Empty or null attributes can be used to create placeholder columns in the export:

```json
{
    "defaultProfile": "With Placeholders",
    "profiles": [
        {
            "id": "123e4567-e89b-42d3-a456-426614174000",
            "label": "With Placeholders",
            "columns": [
                {
                    "columnLabel": "Product Name",
                    "attribute": "product_name"
                },
                {
                    "columnLabel": "Notes",
                    "attribute": ""
                },
                {
                    "columnLabel": "Custom Field",
                    "attribute": null
                }
            ]
        }
    ]
}
```

## Usage

### Get Columns from Profile

```typescript
const columns = await exportProfileDomain.getColumnsFromProfileConfig('profileLabel', 'libraryId', ctx);
```

**Returns:**

- Array of `IExportColumn` objects if successful
- `undefined` if the configuration is invalid or an error occurs

### Behavior

1. **Profile Selection**: The function will use the profile matching `defaultProfile`. If not found, it falls back to
   the first profile in the array.

2. **Empty Attributes**: Columns with empty (`""`) or `null` attributes are valid and will create empty columns in the
   export without fetching data from the API.

3. **Error Handling**: All configuration errors are caught and logged. The function returns `undefined` on error.

## Validation Rules

The configuration is validated using Joi schema with the following rules:

- **defaultProfile**: Must be a non-empty string
- **profiles**: Must have at least 1 profile
- **profile.label**: Must be a non-empty string
- **profile.columns**: Must have at least 1 column
- **column.columnLabel**: Can be any string (including null/empty)
- **column.attribute**: Can be any string (including null/empty)

## Common Issues

### Profile Not Found

If `defaultProfile` doesn't match any profile label, the first profile in the array will be used automatically.

### Empty Profiles Array

At least one profile must be defined in the `profiles` array.

### Empty Columns Array

Each profile must have at least one column defined.
