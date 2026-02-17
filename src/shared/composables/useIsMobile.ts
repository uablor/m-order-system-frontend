import { onBeforeUnmount, onMounted, ref } from 'vue';

export function useIsMobile(breakpointPx = 768) {
  const isMobile = ref(false);

  let mql: MediaQueryList | null = null;
  const update = () => {
    isMobile.value = !!mql?.matches;
  };

  onMounted(() => {
    mql = window.matchMedia(`(max-width: ${breakpointPx}px)`);
    update();
    mql.addEventListener('change', update);
  });

  onBeforeUnmount(() => {
    mql?.removeEventListener('change', update);
  });

  return { isMobile };
}

