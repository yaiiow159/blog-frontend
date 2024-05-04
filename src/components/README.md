# Components
    公用組件區,vue可以根據這目錄底下的組件自動import

## 🚀 案例

```vue
<template>
  <div>
    <MyComponent />
  </div>
</template>

<script  setup>
</script>
```

```vue
<template>
  <div>
    <MyComponent />
  </div>
</template>

<script setup>
  import MyComponent from '@/components/MyComponent.vue'
</script>
```
