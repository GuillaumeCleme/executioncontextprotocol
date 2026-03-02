# Execution Control Protocol (ECP)

> The control plane for cross-system AI agents.

Execution Control Protocol (ECP) is an open specification for defining,
packaging, versioning, and deploying **agent environments** --- portable
configurations that describe what an AI agent can see, what tools it can
access, and when it runs.

ECP is designed to **embrace and extend** the Model Context Protocol
(MCP) --- not replace it.

-   **MCP** standardizes how models call tools.
-   **ECP** standardizes how tools, context, permissions, and triggers
    are bundled into reusable agent environments.

Think of ECP as:

-   Docker Compose for MCP tools
-   Infrastructure-as-code for AI agent environments
-   The missing layer between tool calling (MCP) and multi-agent systems

------------------------------------------------------------------------

## Why ECP?

Today:

-   AI tools live inside chat windows.
-   Agents are embedded inside single apps.
-   Cross-system automations are brittle workflows.
-   Permissions are unclear.
-   Configurations are not portable.

ECP introduces a portable, versioned object called a **Context**.

A Context defines:

-   What MCP servers are available
-   What tools are allowed
-   What data sources are mounted
-   What canonical object types are expected
-   What triggers invoke the agent
-   What outputs are allowed
-   What runtime constraints and guardrails apply

ECP enables:

-   Shareable agent environments
-   Verticalized contexts (e.g., Shopify Ops Context, RevOps Context)
-   Agency-built reusable environments
-   Safe, inspectable cross-system AI execution

------------------------------------------------------------------------

## Relationship to Model Context Protocol (MCP)

ECP builds directly on the Model Context Protocol.

MCP Overview:
https://modelcontextprotocol.io/

MCP Specification (example schema):
https://modelcontextprotocol.io/docs/specification

MCP standardizes:

-   Tool discovery
-   Tool invocation
-   Structured tool outputs

ECP **does not redefine tool calling**.

Instead, ECP:

-   References MCP servers
-   References MCP tool names
-   Uses structured argument schemas
-   Bundles permissions and policies
-   Adds versioning and packaging semantics

If MCP is the "USB interface" for AI tools, ECP is the "container
manifest" that defines the whole operating environment.

------------------------------------------------------------------------

## Conceptual Architecture

Layered stack:

Compute -> Model API -> MCP (Tool Interface) -> ECP (Agent Environment
Spec) -> A2A (Agent Coordination, optional) -> Applications

ECP sits between MCP and application logic.

------------------------------------------------------------------------

## Core Concepts

### Context

A declarative, versioned, parameterized agent environment specification.

Equivalent to a Dockerfile + image manifest.

Defines:

- definition
- mcp.servers
- inputs
- mounts
- policies
- triggers
- outputs

Does not include ephemeral data.

------------------------------------------------------------------------

### Context Instance

A deployed, parameterized installation of a Context.

Equivalent to a Docker container.

Binds:

- Credentials
- Inputs
- Team scope
- Trigger activation

------------------------------------------------------------------------

### Execution

A single execution of an instance in response to a trigger.

Includes:

-   Resolved context snapshot
-   Tool calls
-   Outputs
-   Audit logs

------------------------------------------------------------------------

## Security Principles

ECP is designed with secure-by-default principles inspired by real-world
autonomous agent deployments.

Defaults:

-   Default-deny tool access
-   Scoped permissions (read / write / admin)
-   Write barriers (approval required by default)
-   Runtime budgets (tool calls, cost, time)
-   Provenance tracking of context sources
-   Signed and versioned contexts
-   Short-lived credentials
-   Full audit logging

Contexts must make overly-permissive configurations difficult to express
and difficult to distribute.

------------------------------------------------------------------------

## ECP v0.1 Example Schema

Below is an example Context manifest.

``` yaml
version: ecp/v0.1
kind: Context

metadata:
  name: weekly-ecom-ops
  version: 1.2.3
  description: Weekly ecommerce operational intelligence context

definition:
  models:
    - name: sonnet-4.5
  instructions:
    - role: system
      content: You are an ecommerce expert...
inputs:
  shopify_store_id:
    type: string
    required: true

  slack_channel:
    type: string
    default: "#ops"

  jira_project:
    type: string
    required: true

  refund_rate_threshold:
    type: number
    default: 0.08

servers:
  - name: shopify
    type: mcp
    url: https://mcp.example.com/shopify

  - name: slack
    type: mcp
    url: https://mcp.example.com/slack

  - name: jira
    type: mcp
    url: https://mcp.example.com/jira

mounts:
  - name: orders_last_7d
    from:
      server: shopify
      tool: orders.list
      args:
        storeId: ${inputs.shopifyStoreId}
        windowDays: 7
    asType: Order[]

  - name: tickets_open
    from:
      server: jira
      tool: issues.search
      args:
        project: ${inputs.jiraProject}
        jql: "statusCategory != Done"
    asType: Issue[]

policies:
  allowed_tools:
    - shopify:orders.list
    - jira:issues.search
    - slack:messages.post
    - jira:issues.create

  write_controls:
    requires_approval:
      - jira:issues.create

  budgets:
    max_tool_calls: 50
    max_runtime_seconds: 120

triggers:
  - type: schedule
    cron: "0 8 * * MON"

outputs:
  - type: slack.post
    server: slack
    tool: messages.post
    args:
      channel: ${inputs.slackChannel}
      template: weekly_ops_brief
```

------------------------------------------------------------------------

## What ECP Is NOT

ECP is not:

-   A workflow builder
-   A chat interface
-   A document tool
-   A BI dashboard
-   A replacement for MCP

ECP is:

-   A packaging format for agent environments
-   A governance layer for AI tool access
-   A portable artifact that can be shared and versioned
-   An open specification for cross-system AI operations

------------------------------------------------------------------------

## Open Core Philosophy

ECP is intended to be:

-   Runtime-agnostic
-   Open specification
-   Compatible with any MCP implementation
-   Portable across environments

Hosted platforms may provide:

-   Managed runtimes
-   Credential vaults
-   Approval workflows
-   Registries
-   Observability
-   Team permissions

But the ECP spec itself should remain open.

------------------------------------------------------------------------

## Roadmap

v0.1 Goals:

-   Minimal, implementable manifest
-   MCP-aligned semantics
-   Default-deny security posture
-   Versioned Contexts
-   Parameterization
-   Trigger support
-   Tool allowlists

Future:

-   Signed contexts
-   Registry specification
-   Canonical object schema registry
-   Policy model standardization
-   Multi-agent coordination extensions

------------------------------------------------------------------------

## Get Involved

We welcome:

-   Spec feedback
-   Runtime implementations
-   Context examples
-   Security reviews
-   MCP compatibility testing

If MCP standardized tool calling, ECP aims to standardize portable agent
environments.

Let's build the control plane for cross-system AI agents.
