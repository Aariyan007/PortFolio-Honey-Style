// Two conditions must both be true before onOpen runs once:
// the loader animation reached its exit point (reach), and the scene is ready (open).
// The timeout forces "open" so a slow or broken scene can never trap the user in the loader.
export function createGate({ timeoutMs = 5000, onOpen }) {
  let isReached = false;
  let isOpen = false;
  let fired = false;
  let timer = null;

  const fire = () => {
    if (!isReached || !isOpen || fired) return;
    fired = true;
    clearTimeout(timer);
    onOpen();
  };

  timer = setTimeout(() => {
    isOpen = true;
    fire();
  }, timeoutMs);

  return {
    reach() { isReached = true; fire(); },
    open() { isOpen = true; fire(); },
    dispose() { clearTimeout(timer); },
    get fired() { return fired; },
  };
}
