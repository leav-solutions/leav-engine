# Automation pipeline actions

For now, only 3 actions for development testing.

-   `condition` to test pipeline stop
-   `error` to test action throw error
-   `log` to stdout message during pipeline

Except condition that will be mutated, otherwise the two other will be removed.

## Add action

Can add any action in this folder later.

-   they should implement IAutomationAction
-   have zod schema for params
-   can have optional extra function to valid params

## Action in plugin

Later, plugin will be able to register actions
