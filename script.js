(() => {
  const body = document.body;
  const track = document.querySelector('.track');

  // duplicate the images once so the vertical scroll loops seamlessly
  [...track.children].forEach(img => {
    const clone = img.cloneNode(true);
    clone.alt = '';
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  let entered = false;
  function enter(e) {
    if (entered) return;
    if (e && ((e.target.closest && e.target.closest("a")) || e.key === "Tab")) return;
    entered = true;
    body.classList.add('entered');
    window.removeEventListener('click', enter);
    window.removeEventListener('keydown', enter);
  }

  window.addEventListener('click', enter);
  window.addEventListener('keydown', enter);
})();
