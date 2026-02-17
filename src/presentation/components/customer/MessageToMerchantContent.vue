<template>
  <div>
    <h3>{{ $t('menus.customer.messageToMerchant') }}</h3>
    <a-card>
      <a-textarea placeholder="Type your message here..." :rows="4" />
      <a-button type="primary" class="mt-4">Send</a-button>
    </a-card>
  </div>
</template>

<style scoped>
.mt-4 { margin-top: 16px; }
</style>
