echo "----- PREBUILD VITE APPS STARTED -----"

BASEDIR='/app'
CORE_DIR="$BASEDIR/apps/core"
PORTAL_DIR="$BASEDIR/apps/portal"
CORE_PORTAL_DIST="$BASEDIR/apps/core/applications/portal"
ADMIN_DIR="$BASEDIR/apps/admin"
CORE_ADMIN_DIST="$BASEDIR/apps/core/applications/admin"
DATA_STUDIO_DIR="$BASEDIR/apps/data-studio"
CORE_DATA_STUDIO_DIST="$BASEDIR/apps/core/applications/data-studio"
LOGIN_DIR="$BASEDIR/apps/login"
CORE_LOGIN_DIST="$BASEDIR/apps/core/applications/login"

echo '### INSTALL DEPENDENCIES & WORKSPACES ###'
npm install typescript@4.8.3 -g
yarn install
yarn workspaces focus --all

echo '### BUILD APPS/CORE ###'
cd $CORE_DIR &&  node ./scripts/build.js

echo '### BUILD VITE APPS ###'
# Install & build
cd $PORTAL_DIR && yarn build
rm -rf $CORE_PORTAL_DIST && mkdir -p $CORE_PORTAL_DIST
cp -r $PORTAL_DIR/dist/* $CORE_PORTAL_DIST

# Repeat for admin app
cd $ADMIN_DIR && yarn build
rm -rf $CORE_ADMIN_DIST && mkdir -p $CORE_ADMIN_DIST
cp -r $ADMIN_DIR/dist/* $CORE_ADMIN_DIST

# Repeat for data-studio app
cd $DATA_STUDIO_DIR && yarn install && yarn build
rm -rf $CORE_DATA_STUDIO_DIST && mkdir -p $CORE_DATA_STUDIO_DIST
cp -r $DATA_STUDIO_DIR/dist/* $CORE_DATA_STUDIO_DIST

# Repeat for login app
cd $LOGIN_DIR && yarn install && yarn build
rm -rf $CORE_LOGIN_DIST && mkdir -p $CORE_LOGIN_DIST
cp -r $LOGIN_DIR/dist/* $CORE_LOGIN_DIST

#echo '### GIT PROCESS ###'

# Read version in package.json
#VERSION=$(cat $BASEDIR/package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')

# Add /app/apps/core/applications and dist folders then commit
#cd $CORE_DIR && git add ./dist -f && git add ./applications -f && git commit -m "Update VITE apps dist folders for version: $VERSION"

#git push origin

#sleep 6000

echo "----- PREBUILD VITE APPS FINISHED -----"
