#!/usr/bin/env bash

yarn build
npm publish --access public

# Deploy storybook to github pages
yarn storybook:deploy
