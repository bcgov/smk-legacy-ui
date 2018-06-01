#!/usr/bin/env sh

set -e

if [ "$1" = 'java' ]; then
    shift
    java -XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap $@
else
    exec "$@"
fi
