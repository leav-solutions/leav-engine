const chokidar = require("chokidar");

let files = {};
let timers = {};

const queue = "log";

const start = (folder, channel) => {
  const checkEvent = (event, path, stats) => {
    const filename = path.replace(/^.*[\\\/]/, "");

    if (files[filename]) {
      endTimer(filename, "move", path);
    } else {
      files[filename] = path;
      timers[filename] = setTimeout(
        endTimer.bind(null, filename, event, path),
        1000
      );
    }
  };

  const endTimer = (filename, event, path) => {
    log(event, path, files[filename]);

    if (files[filename]) {
      clearTimeout(timers[filename]);
    }
    delete timers[filename];
    delete files[filename];

    // console.log("files after delete", files, path)
  };

  const log = (event, path, oldPath) => {
    let info = `The file ${path} has been ${event}`;
    const msg = { event, path, date: Date.now() };
    if (event === "move") {
      info = `The file ${oldPath} has been ${event} to ${path}`;
    }

    channel.assertQueue(queue, {
      durable: false
    });

    //Send message to RabbitMq
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));

    console.log(JSON.stringify(msg));
  };

  // Init watcher
  const watcher = chokidar.watch(folder, {
    ignoreInitial: true,
    alwaysStat: true
  });

  watcher.on("add", (path, stats) => checkEvent("add", path, stats));
  watcher.on("unlink", (path, stats) => checkEvent("unlink", path, stats));
  watcher.on("change", (path, stats) => checkEvent("change", path));
};

module.exports = start;
