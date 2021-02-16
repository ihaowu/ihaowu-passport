<template>
  <h3>应用加载失败</h3>
  <p>{{ title }}</p>
  <p>{{ message }}</p>
  <div><button @click="handleReload">重新加载</button></div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      title: '正在检查环境',
      message: '正在检查网络状况',
    }
  },
  methods: {
    handleReload() {
      location.reload()
    },
  },
}
</script>
