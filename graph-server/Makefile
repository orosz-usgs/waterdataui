NODE_VERSION=$(shell python3 -c "import json; print(json.loads(open('graph-server/package.json').read())['engines']['node'])")

.PHONY: env-graph-server clean-graph-server cleanenv-graph-server watch-graph-server

clean-graph-server:
	@echo "Cleaning graph-server..."
	#cd graph-server && npm run clean


#
# Development targets
#
test-graph-server: build-assets
	@echo 'Running graph-server tests...'
	cd graph-server && npm test

watch-graph-server:
	cd graph-server && npm run watch

#
# Environment configuration targets
#
env-graph-server: assert-graph-node graph-server/node_modules

# Assert that we're using the proper node.js version
assert-graph-node:
ifeq ($(shell node --version), v$(NODE_VERSION))
	@echo 'Using node $(NODE_VERSION)'
else
	@echo 'Please use node.js version $(NODE_VERSION).'
	@echo 'Consider nvm to manage node versions: https://github.com/creationix/nvm'
	@exit 1
endif

graph-server/node_modules:
	cd graph-server && npm install

cleanenv-graph-server: clean-graph-server
	@echo "Cleaning graph-server environment..."
	rm -rf graph-server/node_modules
