/**
 * SUPREME CONTROLS — SECONDARY BUTTON BLOB EFFECT
 * Mouse-direction-aware fill: a circle enters from where the cursor
 * approaches, expands with a bouncy spring, darkens the button.
 * On leave, the blob exits toward the cursor exit point.
 */

(function () {
  'use strict';

  /**
   * Get the point on the button's edge closest to the mouse event.
   * Returns coordinates relative to the button's top-left.
   */
  function getEdgePoint(e, el) {
    var rect = el.getBoundingClientRect();
    var cx = rect.width / 2;
    var cy = rect.height / 2;
    var mx = e.clientX - rect.left - cx;
    var my = e.clientY - rect.top - cy;
    var scale = Math.max(
      Math.abs(mx) / (cx || 1),
      Math.abs(my) / (cy || 1)
    ) || 1;
    return {
      x: (mx / scale) + cx,
      y: (my / scale) + cy,
    };
  }

  function attachBlob(btn) {
    if (btn.dataset.blobInit) return;
    btn.dataset.blobInit = '1';

    // Mark so the CSS fallback :hover is disabled
    btn.classList.add('btn--blob-js');

    // Wrap existing button content in a relative span so it stays above the blob
    var wrapper = document.createElement('span');
    wrapper.className = 'btn-secondary__content';
    // Move all current children into the wrapper
    while (btn.firstChild) {
      wrapper.appendChild(btn.firstChild);
    }
    btn.appendChild(wrapper);

    // Create the blob element (absolutely-positioned, behind the wrapper)
    var blob = document.createElement('span');
    blob.className = 'btn-blob';
    blob.setAttribute('aria-hidden', 'true');
    btn.insertBefore(blob, wrapper);

    btn.addEventListener('mouseenter', function (e) {
      var pt = getEdgePoint(e, btn);
      var size = Math.hypot(btn.offsetWidth, btn.offsetHeight) * 2.2;

      // Snap blob to entry point with no transition
      blob.style.transition = 'none';
      blob.style.width  = size + 'px';
      blob.style.height = size + 'px';
      blob.style.left   = pt.x + 'px';
      blob.style.top    = pt.y + 'px';
      blob.style.transform = 'translate(-50%, -50%) scale(0)';

      // Force reflow so the transition sees the "from" state
      void blob.offsetWidth;

      // Bouncy spring expand
      blob.style.transition =
        // 'transform 550ms cubic-bezier(0.34, 1.56, 0.64, 1)';
        'transform 1000ms cubic-bezier(0.34, 1.56, 0.64, 1)';
      blob.style.transform = 'translate(-50%, -50%) scale(1)';

      btn.classList.add('btn--blob-active');
    });

    btn.addEventListener('mouseleave', function (e) {
      var pt = getEdgePoint(e, btn);

      // Shrink blob toward exit point
      blob.style.transition =
        'transform 380ms cubic-bezier(0.23, 1, 0.32, 1),' +
        'left 380ms cubic-bezier(0.23, 1, 0.32, 1),' +
        'top 380ms cubic-bezier(0.23, 1, 0.32, 1)';
      blob.style.left  = pt.x + 'px';
      blob.style.top   = pt.y + 'px';
      blob.style.transform = 'translate(-50%, -50%) scale(0)';

      var onEnd = function () {
        btn.classList.remove('btn--blob-active');
        blob.removeEventListener('transitionend', onEnd);
      };
      blob.addEventListener('transitionend', onEnd);
    });
  }

  function initBlobButtons() {
    document.querySelectorAll('.btn-secondary').forEach(attachBlob);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlobButtons);
  } else {
    initBlobButtons();
  }

  // Re-run when navbar / footer components are injected
  document.addEventListener('component:loaded', initBlobButtons);

})();
