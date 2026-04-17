document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('nav-header');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuBtn = document.getElementById('menu-btn');

  if (!header || !menuBtn) return;

  const bar = header.querySelector('.max-w-7xl');
  const desktopNav = bar ? bar.querySelector('nav') : null;
  const desktopLangLink = desktopNav ? desktopNav.querySelector('a.inline-flex[href]') : null;

  if (!bar || !desktopLangLink) return;

  let mobileControls = bar.querySelector('.mobile-nav-controls');
  if (!mobileControls) {
    mobileControls = document.createElement('div');
    mobileControls.className = 'mobile-nav-controls md:hidden flex items-center gap-3';
    menuBtn.parentNode.insertBefore(mobileControls, menuBtn);
    mobileControls.appendChild(menuBtn);
  }

  let mobileLangLink = mobileControls.querySelector('.mobile-lang-switch');
  if (!mobileLangLink) {
    mobileLangLink = desktopLangLink.cloneNode(true);
    mobileLangLink.className = 'mobile-lang-switch inline-flex h-7 min-w-[2.75rem] items-center justify-center rounded-sm border border-primary/30 px-2 text-[10px] font-label font-bold uppercase tracking-[0.2em] text-primary transition-colors hover:border-primary/60 hover:text-white';
    mobileControls.insertBefore(mobileLangLink, menuBtn);
  } else {
    mobileLangLink.href = desktopLangLink.href;
    mobileLangLink.textContent = desktopLangLink.textContent;
  }

  const menuLangLink = mobileMenu ? mobileMenu.querySelector('a.inline-flex[href]') : null;
  if (menuLangLink) menuLangLink.remove();
});
