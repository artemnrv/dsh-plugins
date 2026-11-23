/**
 * Host half of the composer-balance bundle.
 *
 * The reading itself is a browser-side decoration: the Client module reads the
 * account balance through the existing `account` Remote namespace and renders
 * one `conversation.composer.dock` entry. Nothing model-facing is registered
 * here, so this half only marks the Loader row as active.
 */
export function apply() {}
