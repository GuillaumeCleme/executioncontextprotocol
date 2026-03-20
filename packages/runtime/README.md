# `@executioncontrolprotocol/runtime`

The **ECP runtime engine**: loads, validates, and executes ECP Context manifests.

## Plugin kinds

Context manifests use **`PluginReference.kind`**: `provider`, `executor`, `logger`, `memory`, and future values. The runtime registry maps these to implementations: model providers (`registerModelProvider` with `kind: "provider"`), executors, and auxiliary plugins such as loggers and memory (`registerPlugin` with `kind: "logger"` \| `"memory"`). Built-in file logging is registered via `registerBuiltinLoggers`.

## Install

```bash
npm install @executioncontrolprotocol/runtime
```

## Links

- **Repo**: `https://github.com/executioncontrolprotocol/executioncontrolprotocol`
- **Issues**: `https://github.com/executioncontrolprotocol/executioncontrolprotocol/issues`
