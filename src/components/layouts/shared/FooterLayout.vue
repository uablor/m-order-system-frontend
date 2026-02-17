<template>
  <a-layout-footer class="footer">
    <div class="footer-content">
      <span>© 2026 M-Order System. All rights reserved.</span>
      <a-space :size="16">
        <a href="#" class="footer-link">Privacy Policy</a>
        <a href="#" class="footer-link">Terms of Service</a>
        <a href="#" class="footer-link">Contact</a>
      </a-space>
    </div>
  </a-layout-footer>
</template>

<style scoped>
.footer { text-align: center; background: #f0f2f5; padding: 24px 50px; }
.footer-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
.footer-link { color: #595959; text-decoration: none; transition: color 0.3s; }
.footer-link:hover { color: #1890ff; }
@media (max-width: 768px) { .footer-content { flex-direction: column; text-align: center; } }
</style>
