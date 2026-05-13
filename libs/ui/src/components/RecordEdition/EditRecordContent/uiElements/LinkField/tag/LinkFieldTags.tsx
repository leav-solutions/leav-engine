import {useState, type FunctionComponent} from 'react';
import {type LinkFieldProps} from '../_types';
import {type JoinLibraryContextFragment, type RecordFormAttributeLinkAttributeFragment} from '_ui/_gqlTypes';
import {AntForm, KitIdCard, KitSpace, KitTag} from 'aristid-ds';
import {LINK_FIELD_ID_PREFIX} from '_ui/constants';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';
import {ComputeIndicator} from '../../shared/ComputeIndicator';
import {type RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';
import {computeCalculatedFlags, computeInheritedFlags} from '../../shared/calculatedInheritedFlags';
import {useUnlinkAllRecords} from '../unlink-all-records/useUnlinkAllRecords';
import {useUnlinkRecord} from './unlink-record/useUnlinkRecord';
import {useLinkRecord} from './link-record/useLinkRecord';
import {Wrapper} from '../shared/Wrapper';
import {InputExtraAlignLeft} from '../shared/InputExtraAlignLeft';
import {InputWrapper} from '../shared/InputWrapper';

export const LinkFieldTags: FunctionComponent<LinkFieldProps> = ({
    element,
    readonly,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues,
    metadataEdit = false,
}) => {
    const {lang} = useLang();

    const {
        settings,
        attribute,
        joinLibraryContext,
    }: {
        settings: typeof element.settings;
        attribute?: RecordFormAttributeLinkAttributeFragment;
        joinLibraryContext?: JoinLibraryContextFragment;
    } = element;

    const [backendValues, setBackendValues] = useState<RecordFormElementsValueLinkValue[]>(element.values);

    const calculatedFlags = computeCalculatedFlags(backendValues);
    const inheritedFlags = computeInheritedFlags(backendValues);
    const label = localizedTranslation(settings.label, lang);
    const form = AntForm.useFormInstance();
    const fieldErrors = form.getFieldError(attribute.id);

    const isFieldInError = fieldErrors.length > 0;

    // TODO: Temporary const that should be removed (and all it's usages) when we will have a proper way to override multiple values
    const tmpCantOverrideValues =
        attribute.multiple_values &&
        (calculatedFlags.calculatedValues?.length > 1 || inheritedFlags.inheritedValues?.length > 1);
    const isReadOnly = attribute.readonly || !attribute.permissions.edit_value || readonly || tmpCantOverrideValues;

    const {UnlinkAllRecordsButton} = useUnlinkAllRecords({
        attribute,
        backendValues,
        setBackendValues,
        onDeleteMultipleValues,
        isReadOnly,
        isFieldInError,
    });

    const {canUnlinkRecord, unlinkRecord} = useUnlinkRecord({
        attribute,
        backendValues,
        isReadOnly,
        setBackendValues,
        onValueDelete,
    });

    const {LinkRecordButton} = useLinkRecord({
        attribute,
        isReadOnly,
        onValueSubmit,
        backendValues,
        setBackendValues,
        joinLibraryContext,
    });

    return (
        <Wrapper $metadataEdit={metadataEdit}>
            <AntForm.Item name={attribute.id} noStyle>
                <InputWrapper
                    id={LINK_FIELD_ID_PREFIX + attribute.id}
                    label={label}
                    required={attribute.required}
                    bordered
                    status={isFieldInError ? 'error' : undefined}
                    helper={isFieldInError ? String(fieldErrors[0]) : undefined}
                    extra={
                        <>
                            <InputExtraAlignLeft>
                                <ComputeIndicator calculatedFlags={calculatedFlags} inheritedFlags={inheritedFlags} />
                            </InputExtraAlignLeft>
                            {UnlinkAllRecordsButton}
                        </>
                    }
                    $readonlyBackground={isReadOnly}
                >
                    <KitSpace direction="vertical">
                        <KitSpace direction="horizontal" size="xxs" wrap>
                            {backendValues.map(value => (
                                <KitTag
                                    key={value.id_value}
                                    type="secondary"
                                    onClose={canUnlinkRecord ? () => unlinkRecord(value.id_value) : undefined}
                                >
                                    <KitIdCard description={value.linkValue.whoAmI?.label} />
                                </KitTag>
                            ))}
                        </KitSpace>
                        {LinkRecordButton}
                    </KitSpace>
                </InputWrapper>
            </AntForm.Item>
        </Wrapper>
    );
};
