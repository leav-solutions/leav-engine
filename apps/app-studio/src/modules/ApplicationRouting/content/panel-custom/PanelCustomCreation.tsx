import {useNavigate, useSearchParams} from 'react-router-dom';
import {RelativePaths} from '../../router/paths';
import {PanelCustom} from './PanelCustom';
import {INIIAL_VALUES_QUERY_PARAMS} from './message-handlers/useNavigateToPanel';

/**
 * A `customCreation` panel: a creation popup whose content is an iframe owning the whole creation
 * flow. The host only reacts to the iframe's `record-created` message by closing the panel — no
 * manual list refresh, the explorer underneath detects the created record by itself through its
 * library-wide record-updates subscription (same contract as `PanelCreationForm`).
 *
 * The optional `formInitialValues` query param (set by a `navigate-to-panel` message targeting this
 * panel) is forwarded as-is to the iframe URL: the embedded app is responsible for interpreting it.
 */
export const PanelCustomCreation = ({source, title}: {source: string; title: string}) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const initialValues = searchParams.get(INIIAL_VALUES_QUERY_PARAMS);
    const sourceWithInitialValues = initialValues
        ? `${source}${source.includes('?') ? '&' : '?'}${new URLSearchParams({
              [INIIAL_VALUES_QUERY_PARAMS]: initialValues,
          }).toString()}`
        : source;

    return (
        <PanelCustom
            source={sourceWithInitialValues}
            title={title}
            recordId={null}
            onRecordCreated={() => navigate(RelativePaths.closeCurrentPanel, {relative: 'path'})}
        />
    );
};
