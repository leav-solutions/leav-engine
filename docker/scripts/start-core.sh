YARN_INSTALL_DONE=node_modules/.yarn_install_done
ROOT_YARN_LOCK=../../yarn.lock
PLUGINS_DIR_PATH=./plugins
PLUGINS_YARN_LOCK=yarn.lock

# Install dependencies
echo "Install apps dependencies $PWD"
if [ ! -f $YARN_INSTALL_DONE ] || [ $YARN_INSTALL_DONE -ot $ROOT_YARN_LOCK ]; then
  echo "Do yarn install"
  yarn install
  touch $YARN_INSTALL_DONE
else
  echo "Dependencies already installed, skipping yarn install."
fi

# Disable for https://gitlab.aristid.com/dev/xstream/engine/xstream/-/merge_requests/1213
if [ -z "$SKIP_PLUGINS_INSTALL" ]; then
  # Install plugins dependencies
  find $PLUGINS_DIR_PATH -name package.json -not -path "*/node_modules/*" | while read -r pkg_file; do
    plugin_dir=$(dirname "$pkg_file")
    cd "$plugin_dir" 
    echo "🚧 Install dependencies for plugin $plugin_dir"
    if [ ! -f $YARN_INSTALL_DONE ] || [ $YARN_INSTALL_DONE -ot $PLUGINS_YARN_LOCK ]; then
      yarn install
      if [ ! -d $(dirname "$YARN_INSTALL_DONE") ]; then
        mkdir -p $(dirname "$YARN_INSTALL_DONE")
      fi
      touch $YARN_INSTALL_DONE
    else
      echo "Dependencies already installed for plugin $plugin_dir, skipping yarn install."
    fi
    cd -
  done
fi

echo "📚 Run migration scripts"
yarn run db:migrate:dev

# Enable NODE_OPTIONS only AFTER yarn install + db migrate.
# Setting it earlier would crash the first `yarn install` (the OTel package isn't
# in node_modules yet) and would needlessly instrument every yarn/migrate process.
if [ "$OTEL_AUTO_INSTRUMENT" = "1" ] || [ "$OTEL_AUTO_INSTRUMENT" = "true" ]; then
  export NODE_OPTIONS="--import @opentelemetry/auto-instrumentations-node/register${NODE_OPTIONS:+ $NODE_OPTIONS}"
  echo "🔭 OTel auto-instrumentation enabled (NODE_OPTIONS=$NODE_OPTIONS)"
fi

echo "🛒 Start the server in watch mode"
exec yarn run start:watch
