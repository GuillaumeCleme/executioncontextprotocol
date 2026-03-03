# Spec: Execution Control Protocol (ECP)

## Overview

The **Execution Control Protocol (ECP)** defines a portable
specification for configuring, orchestrating, and executing AI agent
environments across systems.

ECP is designed to sit **above Model Context Protocol (MCP)** and
**alongside Agent‑to‑Agent (A2A)** communication systems.

The protocol standardizes:

-   Agent orchestration
-   Context hydration
-   Tool invocation
-   Execution governance
-   Multi-agent coordination
-   Security boundaries
-   Portable context definitions

ECP introduces a first‑class object called a **Context**, which
represents a **complete execution environment for AI agents**.

A Context defines:

-   Which agents participate
-   Which agent is the orchestrator
-   What triggers execution
-   What schemas define outputs
-   How agents are orchestrated
-   How each agent accesses tools and data

ECP intentionally **does not define model internals or reasoning
chains**. Instead it defines the **execution surface and coordination
rules**.

------------------------------------------------------------------------

# Design Goals

ECP was designed around several principles:

### 1. Protocol Composability

ECP does not replace other protocols.

Instead it coordinates them:

  Layer   Responsibility
  ------- -------------------------------------------
  MCP     Tool discovery and invocation
  A2A     Agent‑to‑agent communication
  ECP     Agent orchestration and execution control

### 2. Deterministic Execution Surfaces

Agent environments should be inspectable and reproducible.

ECP achieves this through:

-   Declarative Context manifests
-   Explicit mounts
-   Explicit policies
-   Structured schemas

### 3. Least‑Privilege Execution

Agents should only access what they need.

Security boundaries exist at the **executor level**, not the global
context.

### 4. Multi‑Agent Orchestration

Contexts allow **multiple specialized agents** to collaborate.

ECP standardizes orchestration strategies such as:

-   Single executor
-   Controller‑specialist
-   Map‑reduce
-   Hierarchical delegation

### 5. Progressive Context Hydration

To prevent large context windows and cost explosions, ECP uses staged
mounts:

  Stage   Purpose
  ------- ----------------------------
  Seed    Metadata and references
  Focus   Selected objects
  Deep    Full documents or payloads

This pattern prevents unnecessary data loading.

------------------------------------------------------------------------

# Core Concepts

## Context

A **Context** is the root execution object in ECP.

A Context contains:

-   Inputs
-   Outputs
-   Schemas
-   Triggers
-   Orchestration configuration
-   Executors

Contexts are **portable artifacts** that define a complete agent
execution environment.

------------------------------------------------------------------------

## Executors

Executors represent **agent roles**.

Each executor defines:

-   Model configuration
-   Protocol implementations
-   Mounts
-   Tool access
-   Security policies
-   Runtime budgets

Executors operate independently and only access data permitted by their
policies.

------------------------------------------------------------------------

## Orchestrator

The **orchestrator** is the executor designated as the entry point.

Responsibilities:

-   Produce an execution plan
-   Select which mounts to expand
-   Delegate work to specialists
-   Merge specialist results
-   Produce final output

------------------------------------------------------------------------

## Specialists

Specialist executors perform focused tasks such as analytics or document
review.

They receive instructions and scoped context from the orchestrator.

------------------------------------------------------------------------

# Mounts

Mounts define how data is retrieved from external systems using MCP
tools.

Mounts run in three stages:

### Seed

Lightweight metadata and Ref objects.

### Focus

Expanded data selected by the orchestrator.

### Deep

Full content retrieval for a limited subset.

------------------------------------------------------------------------

# Ref Objects

Ref objects are lightweight identifiers returned by seed mounts.

Example fields:

-   id
-   source
-   title
-   updatedAt
-   snippet

They allow the orchestrator to reason about data without loading full
payloads.

------------------------------------------------------------------------

# Policies

Policies define executor‑scoped security controls.

Policies include:

-   tool access allowlists
-   runtime budgets
-   network restrictions
-   write controls

Default model: **deny everything unless explicitly allowed**.

------------------------------------------------------------------------

# Protocols

Executors declare protocols they use.

Typical configuration:

agentOrchestration → A2A\
toolInvocation → MCP

Future versions may support additional protocol types.

------------------------------------------------------------------------

# Orchestration Strategies

ECP standardizes orchestration patterns:

### Single

One executor handles everything.

### Delegate

Orchestrator delegates work to specialists.

### Swarm

Work is distributed across many agents and aggregated.

------------------------------------------------------------------------

# Triggers

Triggers initiate Context runs.

Examples:

-   schedule
-   webhook
-   manual invocation
-   tool events

------------------------------------------------------------------------

# Schemas

Schemas define structured outputs used for planning, validation, and
automation.

Executors reference schemas using outputSchemaRef.

------------------------------------------------------------------------

# Inputs

Inputs parameterize reusable contexts similar to environment variables.

------------------------------------------------------------------------

# Outputs

Outputs represent final results from a Context run.

These may later map to notifications, artifacts, or tool actions.

------------------------------------------------------------------------

# Security Model

Key principles:

-   Default deny tool access
-   Executor‑scoped policies
-   Write proposal barriers
-   Runtime budgets
-   Auditability

------------------------------------------------------------------------

# Execution Lifecycle

1.  Trigger fires
2.  Context loads
3.  Orchestrator runs
4.  Seed mounts hydrate
5.  Plan generated
6.  Specialists execute
7.  Focus/deep mounts hydrate
8.  Results produced
9.  Orchestrator merges outputs
10. Final output emitted

------------------------------------------------------------------------

# Relationship to MCP

MCP standardizes tool access.

ECP orchestrates how agents use those tools.

------------------------------------------------------------------------

# Relationship to A2A

A2A handles agent communication.

ECP defines the orchestration strategy governing those interactions.

------------------------------------------------------------------------

# Future Extensions

Potential roadmap areas:

-   agent discovery registries
-   signed Context manifests
-   cost accounting
-   runtime observability
-   artifact storage protocols
