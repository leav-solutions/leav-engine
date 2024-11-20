/*
Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
This file is released under LGPL V3
License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
*/
# Drag and drop library

Date: 19/11/2024

## Context:

We used to use [react-beautiful-dnd](https://github.com/atlassian/react-beautiful-dnd) to handle drag and drop on LEAV. Unfortunately, this library is not maintained anymore by Atlassian and we need to find a new one for future development and eventually migrate previous code.

### Options:
1. [pragmatic-drag-and-drop](https://github.com/atlassian/pragmatic-drag-and-drop)
    - Pros:
        - Maintained by Atlassian (the team behind react-beautiful-dnd)
        - Actively maintained
    - Cons:
        - Unknown by the team

2. [dnd-kit](https://github.com/clauderic/dnd-kit)
    - Pros:
        - Known by the team (already used in other projects)
        - Lot of embedded use cases (lists, grid...)
        - Quite small (about 10kb)
        - Popular (~13k stars on Github)
    - Cons:
        - Migration needed for existing code

3. [react-dnd](https://github.com/react-dnd/react-dnd)
    - Pros:
        - Very modular
        - Very popular (~21k stars on Github)
    - Cons:
        - Steep learning curve
        - Low maintenance (last release in 2022)

4. Any fork of react-beautiful-dnd
    - Pros:
        - Same API as react-beautiful-dnd.
        - No migration needed for existing code.
    - Cons:
        - Maintenance is pretty random as it might depend on small teams or even individuals

## Sources
- https://github.com/atlassian/react-beautiful-dnd/issues/2672

## Decision:

We'll be using dnd-kit for future development as it's a very complete library, easy to use, with a good accessibility and already known by the team.
Existing code might be eventually migrated but there's no rush as it works fine for now.