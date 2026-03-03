import { onBeforeUnmount, onMounted, ref, computed } from 'vue';

/**
 * Breakpoints:
 *   mobile  < 768 px
 *   tablet  768 – 1024 px  (covers Galaxy Tab S7 ~800px portrait, ~1340px landscape)
 *   desktop > 1024 px
 */
export function useIsMobile(breakpointPx = 768) {
  const windowWidth = ref(
    typeof window !== 'undefined' ? window.innerWidth : 1280,
  );

  const onResize = () => {
    windowWidth.value = window.innerWidth;
  };

  onMounted(() => {
    windowWidth.value = window.innerWidth;
    window.addEventListener('resize', onResize);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize);
  });

  const isMobile = computed(() => windowWidth.value < breakpointPx);
  const isTablet = computed(
    () => windowWidth.value >= 768 && windowWidth.value <= 1024,
  );
  const isDesktop = computed(() => windowWidth.value > 1024);

  return { isMobile, isTablet, isDesktop, windowWidth };
}
