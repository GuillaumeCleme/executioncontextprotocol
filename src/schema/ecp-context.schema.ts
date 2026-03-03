/**
 * JSON Schema for the ECP Context manifest.
 *
 * We use a plain object rather than AJV's JSONSchemaType generic because the
 * ECP spec allows flexible nested schema definitions. The TypeScript types in
 * src/types/ecp.ts provide compile-time safety; this schema provides runtime
 * validation via AJV.
 */
export const ecpContextSchema = {
  type: "object",
  required: ["apiVersion", "kind", "metadata", "orchestration", "executors"],
  additionalProperties: false,
  properties: {
    apiVersion: { type: "string" },
    kind: { type: "string", const: "Context" },

    metadata: {
      type: "object",
      required: ["name", "version"],
      additionalProperties: false,
      properties: {
        name: { type: "string" },
        version: { type: "string" },
        description: { type: "string" },
      },
    },

    inputs: {
      type: "object",
      additionalProperties: {
        type: "object",
        required: ["type"],
        additionalProperties: true,
        properties: {
          type: { type: "string" },
        },
      },
    },

    outputs: {
      type: "array",
      items: {
        type: "object",
        required: ["name", "fromSchema"],
        additionalProperties: true,
        properties: {
          name: { type: "string" },
          fromSchema: { type: "string" },
        },
      },
    },

    schemas: {
      type: "object",
      additionalProperties: {
        type: "object",
        additionalProperties: true,
      },
    },

    triggers: {
      type: "array",
      items: {
        type: "object",
        required: ["type"],
        additionalProperties: true,
        properties: {
          type: { type: "string" },
        },
      },
    },

    orchestration: {
      type: "object",
      required: ["entrypoint", "strategy"],
      additionalProperties: true,
      properties: {
        entrypoint: { type: "string" },
        strategy: { type: "string" },
        defaults: {
          type: "object",
          additionalProperties: true,
          properties: {
            maxDelegations: { type: "number" },
            maxSpecialists: { type: "number" },
            timeoutMs: { type: "number" },
          },
        },
        requires: {
          type: "array",
          items: { type: "string" },
        },
        produces: { type: "string" },
      },
    },

    executors: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["name", "type"],
        additionalProperties: true,
        properties: {
          name: { type: "string" },
          type: { type: "string" },
          protocols: {
            type: "object",
            additionalProperties: {
              type: "object",
              required: ["type", "version"],
              additionalProperties: false,
              properties: {
                type: { type: "string" },
                version: { type: "string" },
              },
            },
          },
          model: {
            type: "object",
            required: ["provider", "name"],
            additionalProperties: false,
            properties: {
              provider: { type: "string" },
              name: { type: "string" },
            },
          },
          instructions: { type: "string" },
          outputSchemaRef: { type: "string" },
          mounts: {
            type: "array",
            items: {
              type: "object",
              required: ["name", "stage", "from"],
              additionalProperties: true,
              properties: {
                name: { type: "string" },
                stage: { type: "string", enum: ["seed", "focus", "deep"] },
                from: {
                  type: "object",
                  required: ["server", "tool"],
                  additionalProperties: true,
                  properties: {
                    server: { type: "string" },
                    tool: { type: "string" },
                  },
                },
              },
            },
          },
          policies: {
            type: "object",
            additionalProperties: true,
          },
        },
      },
    },
  },
} as const;
