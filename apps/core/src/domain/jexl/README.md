# Jexl in leav

- [Functional documentation](https://aristid.atlassian.net/wiki/spaces/PRODUIT/pages/2087256077/Calcul+Jexl)
- Base language module: [jexl](https://github.com/TomFrost/jexl)
- Extended language module: [jexl-extended](https://github.com/konnektr-io/jexl-extended)
- POC: https://gitlab.aristid.com/dev/leav/pocs/poc-preprocessing

## Possible evolutions

### getRecord function

`getRecord("libraryId", "recordId")`, but still need ctx.

=> push ctx in root context `$` to allow to pass it in getRecord arguments.

```
jexlContext: {
  $: {
    currentRecord,
    currentValues,
    currentUser,
    __jexlContextType,
    __getJexlQueryCtx
  }
}
```

So getRecord usage become `getRecord($, "libraryId", "recordId")` or `$ | getRecord("libraryId", "recordId")`.

Of course that also change other context access: `$.currentRecord`, `$.currentValues`, `$.currentUser`.

POC: https://gitlab.aristid.com/dev/leav/pocs/poc-preprocessing/-/commit/d875a296e25e3a7d47cbc866834f4e340410d9ef

### setVar function

`setVar($, "varName", varValue)` to define a variable accessible in `$.vars.varName`

For instance

```
    `setVar($, "X", 42) &&
     setVar($, "Y", 2) &&
     $.vars.X + $.vars.Y`,
```

POC: https://gitlab.aristid.com/dev/leav/pocs/poc-preprocessing/-/commit/650d92df4a9dae386c2e12d705405734f3b5ce1c

## Some exemples

### Get

#### List sub entities values

`currentRecord | getValues("test_jexl_campaigns") | map("value | getValues('campaigns_label') | first")` => "campaign-label1", "campaign-label2"
`currentRecord | getValues('test_jexl_offer_cateogries') | map("value | getValues('offer_categories_label')  | first")` => "offer-label1", "offer-label2"
`map(getValues(currentRecord, "test_jexl_campaigns"), "first(getValues(value, 'campaigns_label'))")`
`map(getValues(currentRecord, 'test_jexl_offer_cateogries'), "first(getValues(value, 'offer_categories_label'))")`
`currentRecord | getValues("test_jexl_campaigns") | map("value | getValues('campaigns_circuit_types') | map('value | getValues(\'lov_value\') | first')") | flatten | distinct`

#### Concat sub entities values labels, with default if none

`currentRecord | getValues("test_jexl_campaigns") | length > 0 ? (currentRecord | getValues("test_jexl_campaigns") | map("value | getValues('campaigns_label') | first") | join (" | ")) : "Pas de campagnes"` => "offer-label | offer-label2" ou "Pas de campagnes"
`length(getValues(currentRecord, "test_jexl_campaigns")) > 0 ? join(map(getValues(currentRecord, "test_jexl_campaigns"), "first(getValues(value, 'campaigns_label'))"), " | ") : "Pas de campagnes"`

#### Recopy label

`"copy: " + (currentRecord | getValues("test_jexl_label") | first | uppercase)`=> "copy: LABEL_UPPERCASE"
`"copy: " + uppercase(first(getValues(currentRecord, "test_jexl_label")))`

#### Count label length

`currentRecord | getValues("test_jexl_label") | first | length`
`length(first(getValues(currentRecord, "test_jexl_label")))`

#### Extract start date of period

`(currentRecord | getValues('test_jexl_periode') | first).from`
`first(getValues(currentRecord, 'test_jexl_periode')).from`

#### Use current user

`currentUser.lang + " - " + currentUser.record | getValues('email') | first` => "fr - seb@aristid.com"
`currentUser.lang + " - " + first(getValues(currentUser.record, 'email'))`

### Save

#### Multiply number by 2

`currentValues | map ('value * 2')`
`map(currentValues, 'value * 2')`

#### Remplace another tree attribute

`currentRecord | getValues("test_jexl_offer_cateogries") | first` + action replace another attribute (tree)
`first(getValues(currentRecord, "test_jexl_offer_cateogries"))`
