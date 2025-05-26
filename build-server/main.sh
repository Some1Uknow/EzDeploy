#!/bin/bash

export GIT_REPOSITORY__URL="$GIT_REPOSITORY__URL"

echo "Starting git clone from: $GIT_REPOSITORY__URL"

if [ -z "$GIT_REPOSITORY__URL" ]; then
    echo "Error: GIT_REPOSITORY__URL environment variable is not set"
    exit 1
fi

if git clone "$GIT_REPOSITORY__URL" /home/app/output; then
    echo "Git clone successful"
else
    echo "Error: Git clone failed"
    exit 1
fi

exec node script.js