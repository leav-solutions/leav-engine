# LEAV Engine - Automate scan
## Error codes
- Common error:
  - `0`: User stop the app
  - `1`: Error uncaught
  - `2`: rootPath folder not found
- Rabbitmq errors:
  - `101`: Can't connect to RabbitMQ
  - `102`: Error when assert exchange
  - `103`: Error when assert queue
  - `104`: Error when bind queue
  - `105`: Can't publish to rabbitMQ
- Redis errors:
  - `201`: Error with redis

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