import { useEffect } from 'react';

const CARD_QUERY = 'article, section, div';
const ACTIVE_CARD_SELECTOR = '[data-card-surface], [data-interactive-card], .gateway-workspace-card';

function isCardSurface(element: Element): boolean {
  if (!(element instanceof HTMLElement)) return false;
  if (element.matches('.workspace-logo-watermark, [data-card-ignore]')) return false;
  if (element.closest('nav, aside')) return false;

  const classes = element.classList;
  const isExplicit =
    element.matches('article, [data-interactive-card], .gateway-workspace-card');
  const hasBorder = classes.contains('border') || classes.contains('border-2');
  const hasRadius = ['rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl'].some((name) =>
    classes.contains(name),
  );
  const hasPadding = Array.from(classes).some((name) =>
    /^(p|px|py)-(?:2|3|4|5|6|7|8|10|12)$/.test(name),
  );
  const hasSurface = Array.from(classes).some((name) => name.startsWith('bg-'));

  if (!isExplicit && !(hasBorder && hasRadius && hasPadding && hasSurface)) return false;

  const bounds = element.getBoundingClientRect();
  if (bounds.width > 0 && bounds.height > 0 && (bounds.width < 140 || bounds.height < 64)) {
    return false;
  }

  return true;
}

export default function CardInteractionManager() {
  useEffect(() => {
    let selectedCard: HTMLElement | null = null;
    let scanFrame = 0;
    const managedCards = new Set<HTMLElement>();

    const registerCards = () => {
      scanFrame = 0;
      document.querySelectorAll<HTMLElement>(CARD_QUERY).forEach((element) => {
        if (!isCardSurface(element)) return;
        element.setAttribute('data-card-surface', 'true');
        managedCards.add(element);
      });
    };

    const scheduleScan = () => {
      if (scanFrame) return;
      scanFrame = window.requestAnimationFrame(registerCards);
    };

    const findCard = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null;

      const registered = target.closest<HTMLElement>(ACTIVE_CARD_SELECTOR);
      if (registered) return registered;

      let candidate = target.closest<HTMLElement>(CARD_QUERY);
      while (candidate) {
        if (isCardSurface(candidate)) {
          candidate.setAttribute('data-card-surface', 'true');
          managedCards.add(candidate);
          return candidate;
        }
        candidate = candidate.parentElement?.closest<HTMLElement>(CARD_QUERY) ?? null;
      }

      return null;
    };

    const selectCard = (target: EventTarget | null) => {
      const nextCard = findCard(target);
      if (!nextCard || nextCard === selectedCard) return;

      selectedCard?.classList.remove('card-interaction-selected');
      selectedCard?.removeAttribute('data-card-selected');

      nextCard.classList.add('card-interaction-selected');
      nextCard.setAttribute('data-card-selected', 'true');
      selectedCard = nextCard;
    };

    const handlePointerDown = (event: PointerEvent) => selectCard(event.target);
    const handlePointerOver = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
        selectCard(event.target);
      }
    };
    const handleFocusIn = (event: FocusEvent) => selectCard(event.target);
    const observer = new MutationObserver(scheduleScan);

    scheduleScan();
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', scheduleScan);
    document.addEventListener('pointerover', handlePointerOver, true);
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('focusin', handleFocusIn, true);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', scheduleScan);
      document.removeEventListener('pointerover', handlePointerOver, true);
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('focusin', handleFocusIn, true);
      if (scanFrame) window.cancelAnimationFrame(scanFrame);

      managedCards.forEach((card) => {
        card.removeAttribute('data-card-surface');
        card.removeAttribute('data-card-selected');
        card.classList.remove('card-interaction-selected');
      });
    };
  }, []);

  return null;
}
