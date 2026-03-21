/**
 * Best-practices default for `ecp config init` (mirrors repo `config/ecp.config.example.yaml`).
 */
export const DEFAULT_ECP_SYSTEM_CONFIG_YAML = `# ECP system config — best-practices default
# Edit with: ecp config … or your editor (YAML or JSON).

plugins:
  allowEnable:
    - openai
    - ollama
  defaultEnable:
    - openai
  security:
    allowKinds: [provider]
    allowSourceTypes: [builtin]
    allowIds: [openai, ollama]

modelProviders:
  openai:
    defaultModel: gpt-4o-mini
    allowedModels: [gpt-4o-mini, gpt-4o]
  ollama:
    baseURL: http://localhost:11434
    defaultModel: gemma3:1b
    allowedModels: [gemma3:1b, llama3.2:3b]

# loggers:
#   defaultEnable: [file]
#   allowEnable: [file]
#   config: {}

# agentEndpoints: {}

# toolServers: {}
`;
