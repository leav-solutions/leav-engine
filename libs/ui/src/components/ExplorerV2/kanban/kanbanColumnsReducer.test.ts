import {kanbanColumnsReducer, type KanbanColumnsState} from './kanbanColumnsReducer';
import {type IItemData} from '../_types';

const card = (id: string): IItemData => ({itemId: id, key: id}) as IItemData;

const cardIds = (state: KanbanColumnsState, columnId: string) => state[columnId].cards.map(c => c.itemId);

describe('kanbanColumnsReducer', () => {
    describe('countsLoaded', () => {
        it('initializes one empty column state per counted column', () => {
            const state = kanbanColumnsReducer({}, {type: 'countsLoaded', countByColumnId: {draft: 12, validated: 3}});

            expect(state).toEqual({
                draft: {cards: [], count: 12, isLoadingMore: false},
                validated: {cards: [], count: 3, isLoadingMore: false},
            });
        });

        it('keeps already-loaded cards when counts are refreshed', () => {
            const initial: KanbanColumnsState = {draft: {cards: [card('a')], count: 12, isLoadingMore: false}};

            const state = kanbanColumnsReducer(initial, {type: 'countsLoaded', countByColumnId: {draft: 11}});

            expect(cardIds(state, 'draft')).toEqual(['a']);
            expect(state.draft.count).toBe(11);
        });
    });

    describe('cardsLoadStarted / cardsLoadFailed', () => {
        it('flags then unflags the column as loading', () => {
            const initial = kanbanColumnsReducer({}, {type: 'countsLoaded', countByColumnId: {draft: 12}});

            const loading = kanbanColumnsReducer(initial, {type: 'cardsLoadStarted', columnId: 'draft'});
            expect(loading.draft.isLoadingMore).toBe(true);

            const failed = kanbanColumnsReducer(loading, {type: 'cardsLoadFailed', columnId: 'draft'});
            expect(failed.draft.isLoadingMore).toBe(false);
        });
    });

    describe('cardsLoaded', () => {
        it('appends the cards and clears the loading flag', () => {
            const initial: KanbanColumnsState = {draft: {cards: [card('a')], count: 3, isLoadingMore: true}};

            const state = kanbanColumnsReducer(initial, {
                type: 'cardsLoaded',
                columnId: 'draft',
                cards: [card('b'), card('c')],
                isLastPage: false,
            });

            expect(cardIds(state, 'draft')).toEqual(['a', 'b', 'c']);
            expect(state.draft.isLoadingMore).toBe(false);
        });

        it('deduplicates appended cards by itemId', () => {
            const initial: KanbanColumnsState = {draft: {cards: [card('a')], count: 2, isLoadingMore: true}};

            const state = kanbanColumnsReducer(initial, {
                type: 'cardsLoaded',
                columnId: 'draft',
                cards: [card('a'), card('b')],
                isLastPage: false,
            });

            expect(cardIds(state, 'draft')).toEqual(['a', 'b']);
        });

        it('marks the column exhausted on a short page, even though the count still claims more', () => {
            // GIVEN a column whose count (search-blind, V1) announces 12 records
            const initial: KanbanColumnsState = {draft: {cards: [card('a')], count: 12, isLoadingMore: true}};

            // WHEN a page comes back short (the search narrowed the real record set)
            const state = kanbanColumnsReducer(initial, {
                type: 'cardsLoaded',
                columnId: 'draft',
                cards: [card('b')],
                isLastPage: true,
            });

            // THEN the column is exhausted: no more pages to offer despite cards.length < count
            expect(state.draft.isExhausted).toBe(true);
            expect(state.draft.cards.length).toBeLessThan(state.draft.count);
        });

        it('keeps the column exhausted once flagged, whatever later pages report', () => {
            const initial: KanbanColumnsState = {
                draft: {cards: [card('a')], count: 12, isLoadingMore: true, isExhausted: true},
            };

            const state = kanbanColumnsReducer(initial, {
                type: 'cardsLoaded',
                columnId: 'draft',
                cards: [card('b')],
                isLastPage: false,
            });

            expect(state.draft.isExhausted).toBe(true);
        });
    });

    describe('reset', () => {
        it('drops every column state', () => {
            const initial = kanbanColumnsReducer({}, {type: 'countsLoaded', countByColumnId: {draft: 12}});

            expect(kanbanColumnsReducer(initial, {type: 'reset'})).toEqual({});
        });
    });

    describe('columnsReset', () => {
        it('clears the cards and the exhausted flag of the targeted column only', () => {
            // GIVEN two columns, the first exhausted by a previous short page
            const initial: KanbanColumnsState = {
                draft: {cards: [card('a')], count: 12, isLoadingMore: false, isExhausted: true},
                validated: {cards: [card('b')], count: 2, isLoadingMore: false},
            };

            // WHEN the first column is reset for an isolated reload
            const state = kanbanColumnsReducer(initial, {type: 'columnsReset', columnIds: ['draft']});

            // THEN it restarts from a clean, non-exhausted loading state; the other column is untouched
            expect(state.draft).toEqual({cards: [], count: 12, isLoadingMore: true, isExhausted: false});
            expect(state.validated).toBe(initial.validated);
        });
    });

    describe('cardMoved', () => {
        const initial: KanbanColumnsState = {
            draft: {cards: [card('a'), card('b')], count: 5, isLoadingMore: false},
            validated: {cards: [card('c')], count: 2, isLoadingMore: false},
        };

        it('moves the card across columns and adjusts both counts', () => {
            const state = kanbanColumnsReducer(initial, {
                type: 'cardMoved',
                card: card('a'),
                fromColumnId: 'draft',
                toColumnId: 'validated',
            });

            expect(cardIds(state, 'draft')).toEqual(['b']);
            expect(state.draft.count).toBe(4);
            expect(cardIds(state, 'validated')).toEqual(['c', 'a']);
            expect(state.validated.count).toBe(3);
        });

        it('is a no-op when source and target are the same column', () => {
            const state = kanbanColumnsReducer(initial, {
                type: 'cardMoved',
                card: card('a'),
                fromColumnId: 'draft',
                toColumnId: 'draft',
            });

            expect(state).toBe(initial);
        });

        it('does not duplicate a card already present in the target column', () => {
            const state = kanbanColumnsReducer(initial, {
                type: 'cardMoved',
                card: card('c'),
                fromColumnId: 'draft',
                toColumnId: 'validated',
            });

            expect(cardIds(state, 'validated')).toEqual(['c']);
            expect(state.validated.count).toBe(2);
        });
    });
});
