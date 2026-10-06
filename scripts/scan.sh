#!/bin/sh
# Pinned: semgrep 1.177.0, registry ruleset p/default
semgrep scan --config p/default --severity WARNING --severity ERROR --metrics=off \
  --json-output=semgrep.json src
