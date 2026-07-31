import {type IResolvedTreeSelectionConf} from './_types';
import {resolveTreeSelectionConf, TREE_SELECTION_DEFAULTS} from './resolveTreeSelectionConf';

describe('resolveTreeSelectionConf', () => {
    const attributeConf: IResolvedTreeSelectionConf = {
        selectableNodes: 'leaves_only',
        defaultExpanded: true,
        displayRootNode: 'nodeFromAttribute',
        maxDepth: 3,
        showSelectChildrenButton: true,
        showSelectDescendantsButton: true,
    };

    test('Falls back on the system defaults without configuration nor override', () => {
        expect(resolveTreeSelectionConf()).toEqual(TREE_SELECTION_DEFAULTS);
        expect(resolveTreeSelectionConf(null, {})).toEqual(TREE_SELECTION_DEFAULTS);
    });

    test('Uses the attribute configuration over the defaults', () => {
        expect(resolveTreeSelectionConf(attributeConf)).toEqual(attributeConf);
    });

    test('Uses the calling props over the attribute configuration', () => {
        expect(
            resolveTreeSelectionConf(attributeConf, {
                selectableNodes: 'all_nodes',
                displayRootNode: 'nodeFromProp',
                maxDepth: 8,
            }),
        ).toEqual({
            ...attributeConf,
            selectableNodes: 'all_nodes',
            displayRootNode: 'nodeFromProp',
            maxDepth: 8,
        });
    });

    test('Resolves each key on its own', () => {
        expect(resolveTreeSelectionConf({maxDepth: 2}, {showSelectDescendantsButton: true})).toEqual({
            ...TREE_SELECTION_DEFAULTS,
            maxDepth: 2,
            showSelectDescendantsButton: true,
        });
    });

    test('Keeps falsy values, they are not overwritten by the defaults', () => {
        const falsyConf: IResolvedTreeSelectionConf = {
            selectableNodes: 'leaves_only',
            defaultExpanded: false,
            displayRootNode: null,
            maxDepth: 0,
            showSelectChildrenButton: false,
            showSelectDescendantsButton: false,
        };

        // The attribute explicitly says `false`/`0` where the default says otherwise
        expect(resolveTreeSelectionConf(falsyConf)).toEqual(falsyConf);

        expect(
            resolveTreeSelectionConf(
                {defaultExpanded: true, maxDepth: 5, showSelectChildrenButton: true},
                {defaultExpanded: false, maxDepth: 0, showSelectChildrenButton: false},
            ),
        ).toEqual({
            ...TREE_SELECTION_DEFAULTS,
            defaultExpanded: false,
            maxDepth: 0,
            showSelectChildrenButton: false,
        });
    });

    test('Ignores undefined overrides, as spread from optional props', () => {
        expect(
            resolveTreeSelectionConf(attributeConf, {
                selectableNodes: undefined,
                defaultExpanded: undefined,
                displayRootNode: undefined,
                maxDepth: undefined,
                showSelectChildrenButton: undefined,
                showSelectDescendantsButton: undefined,
            }),
        ).toEqual(attributeConf);
    });
});
