import opentelemetry, {type Counter, type Histogram} from '@opentelemetry/api';

const meter = opentelemetry.metrics.getMeter('events', '0.1.0');

// event_action (not `action`) to stay aligned with the `automation` meter, which already uses this
// name - both dashboards then read with the same label.
//
// Deliberately excluded from every attribute below: `topic.library` / `topic.record.libraryId`,
// `topic.attribute`, the record id, `userId`, and above all `emitter` - which is worth
// `hostname-pid` (see utils.ts `getProcessIdentifier`) and would blow up cardinality on every
// restart. Cardinality is bounded to the `EventAction` enum (~50 members) plus whatever plugins
// register via `registerEventActions`.

export const databaseEventsCounter: Counter = meter.createCounter('leav.events.database.sent.total', {
    description:
        'Number of `sendDatabaseEvent` calls, by `event_action` and `outcome`. `outcome=error` means the ' +
        'publish to RabbitMQ failed and the event is permanently lost: `sendDatabaseEvent` swallows the ' +
        'error and no caller is ever informed.',
});

export const databaseEventPayloadSize: Histogram = meter.createHistogram('leav.events.database.payload.size', {
    description:
        'Size in bytes of the event envelope actually handed to amqp, measured as ' +
        "`Buffer.byteLength(envelope, 'utf8')` (not `String.length`: the JSON payload contains multi-byte " +
        'UTF-8). The sum gives the byte throughput towards RabbitMQ; the distribution surfaces oversized ' +
        'events - `before`/`after` carry whole entities, so a `VALUE_SAVE` on a large record can weigh a lot. ' +
        'Does not carry `outcome`: the size is known before the publish and does not depend on it.',
    unit: 'By',
    advice: {explicitBucketBoundaries: [512, 2048, 8192, 32768, 131072, 524288, 2097152]},
});

export const databaseEventPublishDuration: Histogram = meter.createHistogram('leav.events.database.publish.duration', {
    description:
        'Duration of the RabbitMQ publish call, by `event_action` and `outcome`. The producer channel runs ' +
        'in confirm mode, so this is the latency of the broker **acknowledgment**, not a fire-and-forget send. ' +
        'On a broker disconnection, `amqp-connection-manager` buffers the message and the promise only ' +
        'resolves on reconnection: this metric can legitimately show tens of seconds, hence the 30s last ' +
        'bucket - it is the RabbitMQ back-pressure signal.',
    unit: 'ms',
    advice: {explicitBucketBoundaries: [1, 5, 25, 100, 500, 1000, 5000, 30000]},
});
