# LEAV Engine - Automate scan

## Error codes

- Common error:
    - `0`: User stop the app
    - `1`: Error uncaught
    - `2`: rootPath folder not found
- Redis errors:
    - `201`: Error with redis

RabbitMQ connection is resilient (auto-reconnect with backoff via `@leav/message-broker`'s
`createAmqpConnection`) - no exit code on AMQP connect/publish errors anymore. A failed publish is
logged and the event is lost (rather than crashing the app); `sync-scan`'s periodic reconciliation
catches up on any event missed this way.

## Message sent to RabbitMQ

```
{
  event: string,
  time: number,
  pathAfter: string,
  pathBefore: string,
  inode: number,
  isDirectory: boolean,
  rootKey: any
}
```

- `event`: the event occurred, can be:
    - CREATE
    - REMOVE
    - UPDATE
    - MOVE
- `time`: timestamp when the message is sent
- `pathAfter`: path of the file/folder after the event occurred
- `pathBefore`: path of the file/folder before the event occurred
- `inode`: id of the file/folder
- `isDirectory`: the event occurred on a folder or not
- `rootKey`: information given in the config return here
