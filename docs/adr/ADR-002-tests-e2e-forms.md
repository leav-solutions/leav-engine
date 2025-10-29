# End to end tests for forms

Date: 14/10/2025

## Context:

We use LEAV forms in our respective applications. Currently, these forms are tested with unit tests but not through end-to-end testing.
Following recent refactoring that led to regressions, this glaring omission has been brought to light.

We have therefore decided to implement end-to-end testing on Leav forms.

### Options:
1. Repository
    1. Leav
        Pros:
            - Low effort to add to CI
            - Is consistant with the mono repo
        Cons:
    2. Separate repository
        Pros:
            - It could have be better if we decide to test more than LEAV
        Cons:
            - Can break if we don't pay attention

2. Technical stack
    1. Playwright - cf: [xstream ADR](https://gitlab.aristid.com/dev/xstream/engine/xstream/-/blob/develop/apps/fronts/front-xstream-creative/docs/ADR-004-end-to-end-testing-tool.md?ref_type=heads#end-to-end-testing-tool)
    2. What applications should we run? everything? only what's necessary (leav core, indexation service for search)? data-studio, app-studio?
    3. How to run the tests in a local environment ? run another core? change db?

3. Frequency
    1. every day
        Pros:
            - Takes time between the break and fix
            - Is non blocking for development
    2. each PR
        Pros:
            - Nothing is merged if tests are broken
        Cons:
            - Slower CI

4. How to handle data
    1. Realistic (ex: campaign, offer)
        Pros:
            - Closer to reality
    2. Abstract (ex: tree, linked field)
        Pros:
            - Independant from implementation


5. How to write e2e tests
    - BDD
        Cons:
            - We don't have enough reasons to choose to write test with this pattern
    - PageObjectModel
        Pros:
            - We have written tests using this pattern in the existing e2e test repository.
            We appreciate this pattern and its implementation.



## Sources


## Decision:
1. We have decided to write the e2e tests in the LEAV repository in the [tests folder](../../test-apps/)
The forms tests will be executed on the existing e2e server.
Application tests (planning, creatives, framing) will be carried out in the current separate e2e test repository.
Both tests will have to run on different time schedules.

2. 1. Playwright is chosen.
   2. We believe the tests should reflect as much as possible the user experience. So an app studio will be configured to run the tests.
   3. On a local environment, we must modify the configuration to run the tests on the correct db / core
   4. Target infra: builded core in a container from a given branch, database & caches reset between test suite

3. Trigger scheduled (every day) & manual trigger in CI. We want to allow to run the tests on different branches.

4. We choose to mix abstract and realistic: no dependancy of SDO plugin but some realistic names (campaigns...).
The fields will be created via a script and all data will be reset between tests

5. We decide to write tests with the PageObjectModel pattern.

## Actions
- US : Update gitlab CI to deploy a version with core + indexation manager on the existing environment
- US : Write script to initialize the database and an app-studio. This script will also have to flush caches (redis, rabbitmq...). This script will be run every time we run the tests.
- US : Update gitlab CI to add a new job that runs the e2e tests. This job will have to be scheduled every day and should also allow to be ran manually
- US : Publish a message on Teams when the CI that run e2e tests is KO US : Create a process to handle who have to check why the tests are KO and redirect to the correct squad to fix them. Hint: weekly tribe might be a good time to pass the torch between squads.
