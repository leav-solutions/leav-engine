import {type ComponentProps} from 'react';
import {act, render, screen} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';
import {KitAlert} from 'aristid-ds';
import {
    APICallStatus,
    type FieldSubmitMultipleFunc,
    type ISubmitMultipleResult,
} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {AttributeType} from '_ui/_gqlTypes';
import {type AttributeProperties, type IItemData} from '../_types';
import {ColumnSplitCell} from './ColumnSplitCell';
import {type IColumnSplitOption} from './_types';

vi.mock('aristid-ds', async () => ({
    ...(await vi.importActual('aristid-ds')),
    KitAlert: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const item = {
    libraryId: 'campaigns',
    key: 'record_1',
    itemId: 'record_1',
    propertiesById: {status: [{id_value: 'v1', valuePayload: 'draft'}]},
} as unknown as IItemData;

const option: IColumnSplitOption = {key: 'published', label: 'Published', rawValue: 'published'};

const _buildAttribute = (overrides: Partial<AttributeProperties> = {}): AttributeProperties =>
    ({
        id: 'status',
        type: AttributeType.simple,
        required: false,
        multiple_values: false,
        permissions: {edit_value: true},
        ...overrides,
    }) as AttributeProperties;

// `saveValues` and `t` are now plain props (resolved once in `TableView`), so writing is asserted on a
// stub rather than by spying on the mutation hook's module.
const _mockSaveValues = (result: {status: APICallStatus; error?: string}) =>
    vi.fn<FieldSubmitMultipleFunc>(async () => result as ISubmitMultipleResult);

const _t = ((key: string) => key) as unknown as ComponentProps<typeof ColumnSplitCell>['t'];

describe('ColumnSplitCell', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('renders a checkbox for a multivalued attribute', () => {
        render(
            <ColumnSplitCell
                item={item}
                attribute={_buildAttribute({multiple_values: true})}
                option={option}
                selectedKeys={[]}
                disabled={false}
                setOptimisticKeys={vi.fn()}
                clearOptimisticKeys={vi.fn()}
                saveValues={vi.fn()}
                t={_t}
            />,
        );

        expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    test('renders a checkbox for a mono, non-required attribute', () => {
        render(
            <ColumnSplitCell
                item={item}
                attribute={_buildAttribute({multiple_values: false, required: false})}
                option={option}
                selectedKeys={[]}
                disabled={false}
                setOptimisticKeys={vi.fn()}
                clearOptimisticKeys={vi.fn()}
                saveValues={vi.fn()}
                t={_t}
            />,
        );

        expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    test('renders a radio for a mono, required attribute', () => {
        render(
            <ColumnSplitCell
                item={item}
                attribute={_buildAttribute({multiple_values: false, required: true})}
                option={option}
                selectedKeys={[]}
                disabled={false}
                setOptimisticKeys={vi.fn()}
                clearOptimisticKeys={vi.fn()}
                saveValues={vi.fn()}
                t={_t}
            />,
        );

        expect(screen.getByRole('radio')).toBeInTheDocument();
    });

    test('is disabled when the caller says so (no edit_value permission, or mass selection)', () => {
        render(
            <ColumnSplitCell
                item={item}
                attribute={_buildAttribute()}
                option={option}
                selectedKeys={[]}
                disabled
                setOptimisticKeys={vi.fn()}
                clearOptimisticKeys={vi.fn()}
                saveValues={vi.fn()}
                t={_t}
            />,
        );

        expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    test('checking on a mono non-required attribute (D2): a single write, no explicit uncheck of the other value', async () => {
        const saveValues = _mockSaveValues({status: APICallStatus.SUCCESS});
        const setOptimisticKeys = vi.fn();

        render(
            <ColumnSplitCell
                item={item}
                attribute={_buildAttribute({multiple_values: false, required: false})}
                option={option}
                selectedKeys={['draft']}
                disabled={false}
                setOptimisticKeys={setOptimisticKeys}
                clearOptimisticKeys={vi.fn()}
                saveValues={saveValues}
                t={_t}
            />,
        );

        await userEvent.click(screen.getByRole('checkbox'));

        expect(saveValues).toHaveBeenCalledTimes(1);
        expect(saveValues).toHaveBeenCalledWith({id: item.itemId, library: {id: item.libraryId}}, [
            {attribute: 'status', idValue: null, value: 'published'},
        ]);
        // Optimistic overlay is set to ONLY the newly-checked option — 'draft' is implicitly replaced.
        expect(setOptimisticKeys).toHaveBeenCalledWith(item, 'status', ['published']);
    });

    test("unchecking one value of a multivalued attribute keeps the row's other values", async () => {
        const saveValues = _mockSaveValues({status: APICallStatus.SUCCESS});
        const setOptimisticKeys = vi.fn();
        const multivaluedItem = {
            ...item,
            propertiesById: {
                status: [
                    {id_value: 'v1', valuePayload: 'draft'},
                    {id_value: 'v2', valuePayload: 'published'},
                ],
            },
        } as unknown as IItemData;

        render(
            <ColumnSplitCell
                item={multivaluedItem}
                attribute={_buildAttribute({multiple_values: true})}
                option={option}
                selectedKeys={['draft', 'published']}
                disabled={false}
                setOptimisticKeys={setOptimisticKeys}
                clearOptimisticKeys={vi.fn()}
                saveValues={saveValues}
                t={_t}
            />,
        );

        await userEvent.click(screen.getByRole('checkbox'));

        // Only THIS value is removed, addressed by its own id_value...
        expect(saveValues).toHaveBeenCalledWith(
            {id: multivaluedItem.itemId, library: {id: multivaluedItem.libraryId}},
            [{attribute: 'status', idValue: 'v2', value: null}],
            undefined,
            true,
        );
        // ...and the overlay still expects 'draft', so it can reconcile once the fresh data lands.
        expect(setOptimisticKeys).toHaveBeenCalledWith(multivaluedItem, 'status', ['draft']);
    });

    test('unchecking a value whose write has not come back yet emits NO phantom write', async () => {
        const saveValues = _mockSaveValues({status: APICallStatus.SUCCESS});
        const setOptimisticKeys = vi.fn();
        // The overlay says 'published' is checked (we just wrote it), but the record refresh has not
        // landed: server data still holds 'draft' only, so this option has no `id_value` yet.
        render(
            <ColumnSplitCell
                item={item}
                attribute={_buildAttribute({multiple_values: true})}
                option={option}
                selectedKeys={['draft', 'published']}
                disabled={false}
                setOptimisticKeys={setOptimisticKeys}
                clearOptimisticKeys={vi.fn()}
                saveValues={saveValues}
                t={_t}
            />,
        );

        await userEvent.click(screen.getByRole('checkbox'));

        // Core would answer SUCCESS on that un-addressable delete (no `id_value` = nothing to delete),
        // which would leave the overlay entry stuck and the box unchecked forever.
        expect(saveValues).not.toHaveBeenCalled();
        expect(setOptimisticKeys).not.toHaveBeenCalled();
    });

    test('the control stays enabled while its own write is in flight, but emits a single write', async () => {
        let resolveWrite: (result: ISubmitMultipleResult) => void = () => undefined;
        const saveValues = vi.fn<FieldSubmitMultipleFunc>(
            () =>
                new Promise<ISubmitMultipleResult>(resolve => {
                    resolveWrite = resolve;
                }),
        );

        render(
            <ColumnSplitCell
                item={item}
                attribute={_buildAttribute({multiple_values: true})}
                option={option}
                selectedKeys={[]}
                disabled={false}
                setOptimisticKeys={vi.fn()}
                clearOptimisticKeys={vi.fn()}
                saveValues={saveValues}
                t={_t}
            />,
        );

        await userEvent.click(screen.getByRole('checkbox'));

        // Greying the control for the duration of the round-trip is exactly what reads as latency: the
        // optimistic overlay already shows the target state, so the checkbox must stay live.
        expect(screen.getByRole('checkbox')).toBeEnabled();

        // A second click before the answer comes back is swallowed all the same — it would compute its
        // `nextKeys` and its `id_value` from data the first write has not confirmed yet.
        await userEvent.click(screen.getByRole('checkbox'));
        expect(saveValues).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveWrite({status: APICallStatus.SUCCESS});
        });

        expect(screen.getByRole('checkbox')).toBeEnabled();
    });

    test('a refused write rolls the overlay back and shows an alert', async () => {
        const saveValues = _mockSaveValues({status: APICallStatus.ERROR, error: 'nope'});
        const clearOptimisticKeys = vi.fn();

        render(
            <ColumnSplitCell
                item={item}
                attribute={_buildAttribute({multiple_values: true})}
                option={option}
                selectedKeys={[]}
                disabled={false}
                setOptimisticKeys={vi.fn()}
                clearOptimisticKeys={clearOptimisticKeys}
                saveValues={saveValues}
                t={_t}
            />,
        );

        await userEvent.click(screen.getByRole('checkbox'));

        expect(clearOptimisticKeys).toHaveBeenCalledWith(item, 'status');
        expect(KitAlert.error).toHaveBeenCalled();
    });
});
