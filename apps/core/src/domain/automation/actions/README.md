# Automation pipeline actions

For now, only 4 actions are available.

- `condition` to test pipeline stop
- `jexlCalculation` to test jexl calculation
- `modifyAttribute` to test modify attribute
- `notification` to test notification

## Add action

Can add any action in this folder later.

- they should implement IAutomationAction
- have zod schema for params
- can have optional extra function to valid params

## Action in plugin

Later, plugin will be able to register actions
