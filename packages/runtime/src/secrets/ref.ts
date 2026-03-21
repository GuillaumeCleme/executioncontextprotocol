/**
 * @category Secrets
 */

import type { SecretRef, ToolServerCredentialBinding } from "@executioncontrolprotocol/plugins";

/**
 * Build a {@link SecretRef} from a tool-server credential binding.
 */
export function secretRefFromBinding(binding: ToolServerCredentialBinding): SecretRef {
  const { provider, key, refId } = binding.source;
  return {
    id: refId ?? `ecp://${provider}/${key.replace(/\\/g, "/")}`,
    provider,
    key,
  };
}
