export const HIGHLIGHT_EVENT = "neural:highlight";

// cluster: 0..7 to flare a project cluster, null to clear
export function emitHighlight(cluster) {
  window.dispatchEvent(new CustomEvent(HIGHLIGHT_EVENT, { detail: { cluster } }));
}
