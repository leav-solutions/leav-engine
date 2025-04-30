/*
Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
This file is released under LGPL V3
License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
*/
# ARDs

## Give data to panels

### Needs

We need to give some data to the panel, as the record selected.

### Solutions

We can do it:

* inside URL with a **queryParam** => we need to check if on LEAV login redirection it's kept
* inside **storage** (local or session) => impossible because not sharable
* using **props** during router declaration, on the fly => impossible because not sharable
* using **outlet context** (https://reactrouter.com/6.30.0/hooks/use-outlet-context), on the fly => impossible because
  not sharable

### Decision

We will check for redirection with LEAV in order to use **queryParams** solution.

### Tips

We can use the JSON config file to name the **queryParams**

## Router declaration

### Needs

We need to keep it simple. Simple to write (use `:dynamicRoute`) and simple to use (use `useParams()`) and simple to
navigate (use `generatePath()`).

### Solutions

We may do:

* explore all the structure to find all possible to create explicitly its (ex:
  `/workspace/home/panel/PACs/panel/cadrage`) => hard to parse url to get params, using REGEX
* explore all the structure to find the number of panels level to create its (ex:
  `/workspace/:workspaceId/panel/:panelId/panel/:panelId`) => hard to find the number of max level
* froze the level of recursive panel (ex: `/workspace/:workspaceId/(panel/:panelId)*5`) => should be changes later and
  could not suit every case
* try simple by using only the panel (ex: `/:panelId`) => may be hard to find where we are inside the structure

### Decision

We will try the simplest solution: `{path: "/:panelId"}` with the issue to print all needed components. We assume
uniqueness about panel id inside an application.
