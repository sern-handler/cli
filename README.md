<div align="center">
  <img src="https://raw.githubusercontent.com/sern-handler/.github/main/cli.png" width="900px">
</div>

# Features
- Manage discord application commands from the command line.
- Install plugins from the community.
- Really fast startup times (I think).
- Deploy with premade docker configurations.
- Inhouse build tool based on esbuild built for sern applications, nearly **zero** config.

## Installation

```sh
npm install -g @sern/cli@latest
```

```sh
yarn global add @sern/cli@latest
```

```sh
pnpm add -g @sern/cli@latest
```

## Getting Started

When you install the CLI, you can use our commands with **sern** prefix.

```
Usage: sern [options] [command]


  ___  ___ _ __ _ __
 / __|/ _ \ '__| '_ \
 \__ \  __/ |  | | | |
 |___/\___|_|  |_| |_|

 Welcome!
 If you're new to sern, run npm create @sern/bot for an interactive setup to your new bot project!

 If you have any ideas, suggestions, bug reports, kindly join our support server: https://sern.dev/discord

Options:
  -v, --version      output the version number
  -h, --help         display help for command

Commands:
  init [options]     Quickest way to scaffold a new project [DEPRECATED]
  plugins [options]  Install plugins from https://github.com/sern-handler/awesome-plugins
  extra              Easy way to add extra things in your sern project
  commands           Defacto way to manage your slash commands
  help [command]     display help for command
```

## Setting Up Your Project

Run `npm create @sern/bot` for an interactive setup on a brand new project using our framework.

## Installing Plugins

sern runs on your plugins. Contribute to our [repository](https://github.com/sern-handler/awesome-plugins) and then install the plugins via our cli! <br>
Run `sern plugins` to see all installable plugins.


## Development

```sh
git clone https://github.com/sern-handler/cli.git
```
## insall i
```sh 
npm i 
```
## build it
```sh 
npm run build
```
## make it usable globally
- if sern is installed globally already, you may need to uninstall it.
```sh 
npm link
```
