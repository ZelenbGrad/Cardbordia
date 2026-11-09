'use strict';

const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-menu');
function closeMenu() {
  menu.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть оглавление');
}
menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(expanded));
  menuToggle.setAttribute('aria-label', expanded ? 'Закрыть оглавление' : 'Открыть оглавление');
  menu.hidden = !expanded;
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) {
    closeMenu();
    menuToggle.focus();
  }
});
window.matchMedia('(min-width: 851px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

document.querySelectorAll('[role="tablist"]').forEach(tablist => {
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  function selectTab(tab, focus = false) {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        selectTab(tabs[next], true);
      }
    });
  });
});

const progress = document.querySelector('#progress');
const chapterLinks = [...document.querySelectorAll('[data-chapter]')];
const chapters = chapterLinks.map(link => document.getElementById(link.dataset.chapter));
let scheduled = false;
function updateReading() {
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${scrollRange > 0 ? Math.min(100, Math.max(0, window.scrollY / scrollRange * 100)) : 100}%`;
  const readingLine = Math.min(window.innerHeight * 0.35, 250);
  let current = null;
  chapters.forEach(chapter => {
    if (chapter.getBoundingClientRect().top < readingLine) current = chapter.id;
  });
  chapterLinks.forEach(link => {
    const active = link.dataset.chapter === current;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scheduled) {
    scheduled = true;
    window.requestAnimationFrame(updateReading);
  }
}, { passive: true });
window.addEventListener('resize', updateReading);
window.addEventListener('load', updateReading);
updateReading();

const wordCount = [...document.querySelectorAll('.article')].map(item => item.innerText).join(' ').split(/\s+/).filter(Boolean).length;
document.querySelector('#reading-time').textContent = String(Math.max(1, Math.ceil(wordCount / 170)));

const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('img');
let lastPhotoButton;
document.querySelectorAll('[data-lightbox]').forEach(button => {
  button.addEventListener('click', () => {
    const photo = button.querySelector('img');
    lightboxImage.src = photo.currentSrc || photo.src;
    lightboxImage.alt = photo.alt;
    lightbox.querySelector('p').textContent = photo.alt;
    lastPhotoButton = button;
    lightbox.showModal();
    document.body.style.overflow = 'hidden';
  });
});
lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', event => {
  if (event.target === lightbox) lightbox.close();
});
lightbox.addEventListener('close', () => {
  document.body.style.overflow = '';
  lastPhotoButton?.focus({ preventScroll: true });
});
