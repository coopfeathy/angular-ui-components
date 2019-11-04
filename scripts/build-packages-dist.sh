#!/usr/bin/env bash

# Script that builds the release output of all packages which have the "release-package"
# bazel tag set. The script builds all those packages and copies the release output to a
# folder within the project.

set -u -e -o pipefail

# Go to project directory.
cd $(dirname ${0})/..

# Either "legacy" (view engine) or "aot" (ivy)
compile_mode=${1:-"legacy"}

# Path to the bazel binary. By default uses "bazel" from the node modules but developers
# can overwrite the binary though an environment variable. Also by default if we run Bazel
# from the node modules, we don't want to access bazel through Yarn and NodeJS because it
# could mean that the Bazel child process only has access to limited memory.
bazel=${BAZEL_BIN_PATH:-$(yarn bin bazel)}

echo "######################################"
echo "  building release packages"
echo "  mode: ${compile_mode}"
echo "######################################"
echo ""

# Path to the output directory into which we copy the npm packages.
dest_path="dist/releases"

# Path to the bazel-bin directory.
bazel_bin_path=$(${bazel} info bazel-bin)

# List of targets that need to be built, e.g. //src/lib, //src/cdk, etc. Note we need to remove all
# carriage returns because Bazel prints these on Windows. This breaks the Bash array parsing.
targets=$(${bazel} query --output=label 'attr("tags", "\[.*release-package.*\]", //src/...)' \
  'intersect kind(".*_package", //src/...)' | tr -d "\r")

# Extracts the package name from the Bazel target names.
# e.g. `src/material:npm_package` will result in "material".
dirs=`echo "$targets" | sed -e 's/\/\/src\/\(.*\):npm_package/\1/'`

# Walk through each release package and clear previous "npm_package" outputs. This is
# a workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1219. We need to
# do this to ensure that the version placeholders are properly populated.
for pkg in ${dirs}; do
  pkg_dir="${bazel_bin_path}/src/${pkg}/npm_package"
  if [[ -d ${pkg_dir} ]]; then
    # Make all directories in the previous package output writable. Bazel by default
    # makes tree artifacts and file outputs readonly. This causes permission errors
    # when deleting the folder. To avoid these errors, we make all files writable.
    chmod -R u+w ${pkg_dir}
    rm -Rf ${pkg_dir}
  fi
done

# Walk through each release package target and build it.
for target in ${targets}; do
  echo -e "Building: ${target} ...\n"
  # Build with "--config=release" so that Bazel runs the workspace stamping script. The
  # stamping script ensures that the version placeholder is populated in the release output.
  ${bazel} build --config=release --define=compile=${compile_mode} ${target}
  echo ""
done

# Delete the distribution directory so that the output is guaranteed to be clean. Re-create
# the empty directory so that we can copy the release packages into it later.
rm -Rf ${dest_path}
mkdir -p ${dest_path}

# Copy the package output for all built NPM packages into the dist directory.
for pkg in ${dirs}; do
  pkg_dir="${bazel_bin_path}/src/${pkg}/npm_package"
  target_dir="${dest_path}/${pkg}"

  if [[ -d ${pkg_dir} ]]; then
    echo "> Copying package output to \"${target_dir}\".."
    rm -rf ${target_dir}
    cp -R ${pkg_dir} ${target_dir}
    chmod -R u+w ${target_dir}
  fi
done
