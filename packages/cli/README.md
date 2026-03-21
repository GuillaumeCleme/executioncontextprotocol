# `@executioncontrolprotocol/cli`

Command-line interface for **Execution Control Protocol (ECP)**.

## Install

```bash
npm install -g @executioncontrolprotocol/cli
```

## Usage

```bash
ecp --help
ecp validate path/to/context.yaml
ecp run path/to/context.yaml -i topic="Hello"
```

### System config (`ecp.config.yaml` / `~/.ecp/config.yaml`)

Manage allow-lists, model defaults, MCP tool servers, and more:

```bash
ecp config --help
ecp config init                    # best-practices starter in current directory
ecp config init --global          # ~/.ecp/config.yaml
ecp config path                    # resolved file path (use --for-write for mutation target)
ecp config get --format json
ecp config plugins get
ecp config models get
ecp config tools get
ecp config loggers get
```

`ecp run` accepts `--logger` / `-l` (e.g. `file`) to enable logger **plugins** (`kind: logger`); see `loggers` in system config.

YAML and JSON are supported; defaults are searched in order: `./ecp.config.yaml`, `./ecp.config.json`, then `~/.ecp/`.

## Links

- **Repo**: `https://github.com/executioncontrolprotocol/executioncontrolprotocol`
- **Issues**: `https://github.com/executioncontrolprotocol/executioncontrolprotocol/issues`
