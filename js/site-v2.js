(function () {
  function moveNavIndicator(activeLink) {
    const nav = document.querySelector('.site-nav');
    if (!nav || !activeLink) return;

    nav.style.setProperty('--active-left', activeLink.offsetLeft + 'px');
    nav.style.setProperty('--active-width', activeLink.offsetWidth + 'px');
  }

  function setActiveLink(id) {
    let activeLink = null;

    document.querySelectorAll('.site-nav a').forEach(function (link) {
      const isActive = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', isActive);
      if (isActive) activeLink = link;
    });

    moveNavIndicator(activeLink);
  }

  document.addEventListener('DOMContentLoaded', function () {
    const worksSection = document.getElementById('works');
    const navLinks = document.querySelectorAll('.site-nav a');
    let ticking = false;
    let lockedActiveId = null;
    let lockTimer = null;

    function updateActiveLink() {
      if (lockedActiveId) {
        setActiveLink(lockedActiveId);
        return;
      }

      if (!worksSection) {
        setActiveLink('profile');
        return;
      }

      const thresholdOffset = Math.min(160, window.innerHeight * 0.25);
      const worksTop = worksSection.getBoundingClientRect().top + window.scrollY;
      const activeId = window.scrollY >= worksTop - thresholdOffset ? 'works' : 'profile';
      setActiveLink(activeId);
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        updateActiveLink();
        ticking = false;
      });
    }

    function lockActiveLink(id) {
      lockedActiveId = id;
      setActiveLink(id);

      window.clearTimeout(lockTimer);
      lockTimer = window.setTimeout(function () {
        lockedActiveId = null;
        requestUpdate();
      }, 900);
    }

    updateActiveLink();
    navLinks.forEach(function (link) {
      link.addEventListener('click', function (event) {
        const targetId = link.getAttribute('href').replace('#', '');
        lockActiveLink(targetId);

        if (targetId === 'profile') {
          event.preventDefault();
          window.history.pushState(null, '', '#profile');
          window.scrollTo({
            top: 0,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          });
        }
      });
    });
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    window.addEventListener('load', requestUpdate);
  });
}());
