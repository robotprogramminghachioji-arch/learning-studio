// Learning Studio: use one floating back-to-top button on desktop and mobile.
// This add-on leaves existing Firebase, lessons, login, and browser back logic unchanged.
(() => {
  // Hide the duplicate in-page navigation button, which was always visible even at the top.
  const style = document.createElement('style');
  style.textContent = '#lsPageTop { display: none !important; }';
  document.head.appendChild(style);

  document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('lsToTop');
    if (!button) return;
    const scroller = () => document.scrollingElement || document.documentElement;
    const position = () => Math.max(window.scrollY || 0, scroller().scrollTop || 0);
    const update = () => {
      const root = scroller();
      const scrollable = root.scrollHeight > root.clientHeight + 20;
      button.hidden = !scrollable || position() < 250;
    };

    // Use the actual document scrolling element; intercept the previous click handler.
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const root = scroller();
      if (typeof root.scrollTo === 'function') {
        root.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      } else {
        root.scrollTop = 0;
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, true);

    // Registered after app.js's scroll listener, so this check is the final one.
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const app = document.getElementById('app');
    if (app) {
      const observer = new MutationObserver(() => requestAnimationFrame(update));
      observer.observe(app, { childList: true });
    }
    update();
  });
})();
