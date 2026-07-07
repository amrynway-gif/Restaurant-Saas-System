#!/bin/bash
# Get the absolute path of the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Add the local node bin directory to the front of PATH
export PATH="$PROJECT_DIR/.node/bin:$PATH"

# Run the user's command
exec "$@"
