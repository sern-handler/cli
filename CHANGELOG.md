# Changelog

All notable changes to this project will be documented in this file.

## [0.5.1](https://github.com/sern-handler/cli/compare/v0.5.0...v0.5.1) (2023-06-16)


### Features

* **init:** deprecate init and bump deps ([#102](https://github.com/sern-handler/cli/issues/102)) ([dce78c0](https://github.com/sern-handler/cli/commit/dce78c0945de6da79bf1e268f29651da0c44c1eb))
* version injector ([#90](https://github.com/sern-handler/cli/issues/90)) ([58fa325](https://github.com/sern-handler/cli/commit/58fa3253f62da9fb66d1b2ae901b568367f065d0))


### Bug Fixes

* git not installed errors during init ([#79](https://github.com/sern-handler/cli/issues/79)) ([69287ab](https://github.com/sern-handler/cli/commit/69287ab1bd0c4960384144f90fea8ebded3b0cc5))

## [0.5.0](https://github.com/sern-handler/cli/compare/v0.4.2...v0.5.0) (2022-09-16)


### ⚠ BREAKING CHANGES

* re-write to TypeScript

### Features

* add engine for node version & remove manual version check ([#72](https://github.com/sern-handler/cli/issues/72)) ([2009d1f](https://github.com/sern-handler/cli/commit/2009d1fdca9a383d219304fd3cb48a622355b7dc))
* adds the esm template option + refactors ([#73](https://github.com/sern-handler/cli/issues/73)) ([9271da3](https://github.com/sern-handler/cli/commit/9271da30764f86225385e8ae6448b99d66687294))
* re-write to TypeScript ([bed31c1](https://github.com/sern-handler/cli/commit/bed31c1f4995bbf7d8d0a483f562788172e29919))


### Miscellaneous Chores

* release 0.5.0 ([2018c43](https://github.com/sern-handler/cli/commit/2018c4381e665b9b0c5e70a203aa0dfd9fdd3cef))

## [0.4.2](https://github.com/sern-handler/cli/compare/v0.4.1...v0.4.2) (2022-07-28)


### Features

* switch to undici ([#58](https://github.com/sern-handler/cli/issues/58)) ([c4f8e45](https://github.com/sern-handler/cli/commit/c4f8e45bdc0af5a3bbd394d2b9f852f4a946114c))

## [0.4.1](https://github.com/sern-handler/cli/compare/v0.4.0...v0.4.1) (2022-07-07)


### Features

* add `sern.config.json` ([#38](https://github.com/sern-handler/cli/issues/38)) ([3eb6383](https://github.com/sern-handler/cli/commit/3eb63835d9f6ff3f3426e017ea87344c00bb13a4))
* add basic type checking ([eb85a7a](https://github.com/sern-handler/cli/commit/eb85a7a8f2f6252f719fd396d42cded2d9eb0918))
* add commander and start plugins installer ([#36](https://github.com/sern-handler/cli/issues/36)) ([b2e6236](https://github.com/sern-handler/cli/commit/b2e6236dde6f4848dde6fc23a6222415824bb294))
* add default settings for the -y flag ([#19](https://github.com/sern-handler/cli/issues/19)) ([e5f607e](https://github.com/sern-handler/cli/commit/e5f607e99875e105cbb148cab3ed1bbc3771ae35))
* added actions and formatting stuff ([b302a8b](https://github.com/sern-handler/cli/commit/b302a8b362257fb2cea72b7e1fc66bea351c511f))
* added help command ([ca23d17](https://github.com/sern-handler/cli/commit/ca23d17670663b62e23849e2350deef208bfc100))
* Added version command & created readme ([#25](https://github.com/sern-handler/cli/issues/25)) ([7535a5e](https://github.com/sern-handler/cli/commit/7535a5e0267c9e682b7bc8470206c0597f5ba9a1))
* bump all files to GitHub 🎉 ([01b39ad](https://github.com/sern-handler/cli/commit/01b39ad9b78f0a67e23ba66c10262082675eeed5))
* cli is now functional ([65f38f3](https://github.com/sern-handler/cli/commit/65f38f3eb2b4e8e2bd136b9bd8f37f1966be1661))
* cli is now functional ([5021d28](https://github.com/sern-handler/cli/commit/5021d28bca6ebe1cb4a548f5e595b1220f222c98))
* create typescript dockerfile and the extra command ([#28](https://github.com/sern-handler/cli/issues/28)) ([b1a8683](https://github.com/sern-handler/cli/commit/b1a86833734258e0a22da18c2c780133c199d5cd))
* enable extra command & jsdockerfile ([#43](https://github.com/sern-handler/cli/issues/43)) ([7cf62c0](https://github.com/sern-handler/cli/commit/7cf62c03083b8ebbb8a6a63fd8efe592344d5230))
* **init:** add --sync flag ([#53](https://github.com/sern-handler/cli/issues/53)) ([b24a053](https://github.com/sern-handler/cli/commit/b24a053d1cb8c00d49a96b6d536dd17205b9fa0e))
* making sern help message look better, adding ascii art ([#50](https://github.com/sern-handler/cli/issues/50)) ([9bd2b0f](https://github.com/sern-handler/cli/commit/9bd2b0f38be835a31fceeabdf60487a1424cdf7e))
* more questions, better handling, better ui ([f931802](https://github.com/sern-handler/cli/commit/f9318024bb4c62cee1a7ddfc6af4117c22ca6020))
* now edits the directories as per user's choice ([fec1c8e](https://github.com/sern-handler/cli/commit/fec1c8e24c5ca7752f9e74b0fc3a32716bb42299))
* plugin command!!! ([#45](https://github.com/sern-handler/cli/issues/45)) ([895a489](https://github.com/sern-handler/cli/commit/895a48910e32813f8aa25f57302a4123fc631c2c))
* rebase changes ([cae3c59](https://github.com/sern-handler/cli/commit/cae3c597c3da6aa836fb9c70b8555814e8fc5db0))
* refactored code and added custom handling of commands ([0e97b7d](https://github.com/sern-handler/cli/commit/0e97b7db8afed7f625eeb0a43aa992441ab49b39))
* **skip:** option to skip package manager selection ([#20](https://github.com/sern-handler/cli/issues/20)) ([7b1d535](https://github.com/sern-handler/cli/commit/7b1d53520f0aa35e48b72d61d2f1a85ffdfdfec8))
* using degit to clone the templates ([ddb0285](https://github.com/sern-handler/cli/commit/ddb02850f2096d8c9ec36e766ea74e10d2efce3f))


### Bug Fixes

* avoid crashing of cli when no plugin found ([#47](https://github.com/sern-handler/cli/issues/47)) ([8c45327](https://github.com/sern-handler/cli/commit/8c45327094b2560f7b5c813a1c1925920bd46038))
* fix degit erroring when there's no cache ([fc01554](https://github.com/sern-handler/cli/commit/fc01554fae2726f4ebd39a66ef1cb634a421dd9f))
* **install.js:** fix mistyped. cached -> cache ([fa68936](https://github.com/sern-handler/cli/commit/fa689360ce054c63dab77e8b8f0b794b3b8736e4))
* no more crashing cli if yarn isnt present ([#24](https://github.com/sern-handler/cli/issues/24)) ([88893a3](https://github.com/sern-handler/cli/commit/88893a35cd1144867713de32c5bf52c2dc702450))
* no more error when selecting js ([cc410bd](https://github.com/sern-handler/cli/commit/cc410bd370a751833dbc5fc04030bfa53a6c1fd2))
* prettier things ([1265224](https://github.com/sern-handler/cli/commit/1265224bb9f93cb104915be50c1c2ea1e3924955))
* removed useless line ([f268b1c](https://github.com/sern-handler/cli/commit/f268b1c62fd4d5823d483a33cfef2e2d7f7b127c))


### Performance Improvements

* **init.js:** string.match -> regex.test for node version ([f760dbc](https://github.com/sern-handler/cli/commit/f760dbc6e39e098496f25a5c4ee90855a2bb3bd5))

### [0.2.2](https://github.com/sern-handler/cli/compare/v0.2.1...v0.2.2) (2022-07-05)

### [0.2.1](https://github.com/sern-handler/cli/compare/v0.2.0...v0.2.1) (2022-07-05)


### Features

* making sern help message look better, adding ascii art ([#50](https://github.com/sern-handler/cli/issues/50)) ([9bd2b0f](https://github.com/sern-handler/cli/commit/9bd2b0f38be835a31fceeabdf60487a1424cdf7e))


### Bug Fixes

* avoid crashing of cli when no plugin found ([#47](https://github.com/sern-handler/cli/issues/47)) ([8c45327](https://github.com/sern-handler/cli/commit/8c45327094b2560f7b5c813a1c1925920bd46038))

## [0.2.0](https://github.com/sern-handler/cli/compare/v0.1.3...v0.2.0) (2022-06-22)


### Features

* add `sern.config.json` ([#38](https://github.com/sern-handler/cli/issues/38)) ([3eb6383](https://github.com/sern-handler/cli/commit/3eb63835d9f6ff3f3426e017ea87344c00bb13a4))
* add basic type checking ([eb85a7a](https://github.com/sern-handler/cli/commit/eb85a7a8f2f6252f719fd396d42cded2d9eb0918))
* add commander and start plugins installer ([#36](https://github.com/sern-handler/cli/issues/36)) ([b2e6236](https://github.com/sern-handler/cli/commit/b2e6236dde6f4848dde6fc23a6222415824bb294))
* enable extra command & jsdockerfile ([#43](https://github.com/sern-handler/cli/issues/43)) ([7cf62c0](https://github.com/sern-handler/cli/commit/7cf62c03083b8ebbb8a6a63fd8efe592344d5230))
* plugin command!!! ([#45](https://github.com/sern-handler/cli/issues/45)) ([895a489](https://github.com/sern-handler/cli/commit/895a48910e32813f8aa25f57302a4123fc631c2c))

### [0.1.3](https://github.com/sern-handler/cli/compare/v0.1.2...v0.1.3) (2022-06-10)


### Features

* add default settings for the -y flag ([#19](https://github.com/sern-handler/cli/issues/19)) ([e5f607e](https://github.com/sern-handler/cli/commit/e5f607e99875e105cbb148cab3ed1bbc3771ae35))
* Added version command & created readme ([#25](https://github.com/sern-handler/cli/issues/25)) ([7535a5e](https://github.com/sern-handler/cli/commit/7535a5e0267c9e682b7bc8470206c0597f5ba9a1))
* create typescript dockerfile and the extra command ([#28](https://github.com/sern-handler/cli/issues/28)) ([b1a8683](https://github.com/sern-handler/cli/commit/b1a86833734258e0a22da18c2c780133c199d5cd))
* now edits the directories as per user's choice ([fec1c8e](https://github.com/sern-handler/cli/commit/fec1c8e24c5ca7752f9e74b0fc3a32716bb42299))
* **skip:** option to skip package manager selection ([#20](https://github.com/sern-handler/cli/issues/20)) ([7b1d535](https://github.com/sern-handler/cli/commit/7b1d53520f0aa35e48b72d61d2f1a85ffdfdfec8))
* using degit to clone the templates ([ddb0285](https://github.com/sern-handler/cli/commit/ddb02850f2096d8c9ec36e766ea74e10d2efce3f))


### Bug Fixes

* fix degit erroring when there's no cache ([fc01554](https://github.com/sern-handler/cli/commit/fc01554fae2726f4ebd39a66ef1cb634a421dd9f))
* **install.js:** fix mistyped. cached -> cache ([fa68936](https://github.com/sern-handler/cli/commit/fa689360ce054c63dab77e8b8f0b794b3b8736e4))
* no more crashing cli if yarn isnt present ([#24](https://github.com/sern-handler/cli/issues/24)) ([88893a3](https://github.com/sern-handler/cli/commit/88893a35cd1144867713de32c5bf52c2dc702450))
* no more error when selecting js ([cc410bd](https://github.com/sern-handler/cli/commit/cc410bd370a751833dbc5fc04030bfa53a6c1fd2))

### [0.1.1](https://github.com/sern-handler/cli/compare/v0.1.0...v0.1.1) (2022-05-09)


### Features

* added help command ([ca23d17](https://github.com/sern-handler/cli/commit/ca23d17670663b62e23849e2350deef208bfc100))
* cli is now functional ([5021d28](https://github.com/sern-handler/cli/commit/5021d28bca6ebe1cb4a548f5e595b1220f222c98))


### Bug Fixes

* prettier things ([1265224](https://github.com/sern-handler/cli/commit/1265224bb9f93cb104915be50c1c2ea1e3924955))
* removed useless line ([f268b1c](https://github.com/sern-handler/cli/commit/f268b1c62fd4d5823d483a33cfef2e2d7f7b127c))

## 0.1.0 (2022-04-21)


### Features

* added actions and formatting stuff ([b302a8b](https://github.com/sern-handler/cli/commit/b302a8b362257fb2cea72b7e1fc66bea351c511f))
* bump all files to GitHub 🎉 ([01b39ad](https://github.com/sern-handler/cli/commit/01b39ad9b78f0a67e23ba66c10262082675eeed5))
* more questions, better handling, better ui ([f931802](https://github.com/sern-handler/cli/commit/f9318024bb4c62cee1a7ddfc6af4117c22ca6020))
* refactored code and added custom handling of commands ([0e97b7d](https://github.com/sern-handler/cli/commit/0e97b7db8afed7f625eeb0a43aa992441ab49b39))
