LOCK_VERSION=`npx json -f package-lock.json dependencies.@textile/grpc-powergate-client.version`
RELEASE_VERSION="v"$LOCK_VERSION
curl -L https://github.com/textileio/powergate/releases/download/$RELEASE_VERSION/powergate-docker-$RELEASE_VERSION.zip -o powergate-docker-$RELEASE_VERSION.zip
unzip powergate-docker-$RELEASE_VERSION.zip
rm -rf powergate-docker
mv powergate-docker-$RELEASE_VERSION powergate-docker
rm -rf powergate-docker-$RELEASE_VERSION.zip
