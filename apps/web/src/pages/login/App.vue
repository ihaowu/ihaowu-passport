<template>
  <h3>登录</h3>
  <a-form>
    <a-form-item label="用户名">
      <a-input v-model:value="state.username" placeholder="用户名/邮箱/手机号"></a-input>
    </a-form-item>
    <a-form-item label="密码">
      <a-input v-model:value="state.password" type="password"></a-input>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" :loading="state.loading" @click="handleSubmit()">
        登录
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script lang="ts">
import axios from 'axios'

import { defineComponent, reactive } from 'vue'
import { Form, Input, Button, message } from 'ant-design-vue'

import { pick } from 'lodash-es'

import http from '@/util/http'

export default defineComponent({
  name: 'App',
  setup() {
    const state = reactive({
      activeKey: 'email',
      // 账号密码登录
      username: '',
      password: '',
      // 快捷登录
      mobile: '',
      code: '',
      loading: false,
    })

    /**
     * @todo 缺少后续操作：3秒后重定向回原来的地方
     */
    async function handleSubmit() {
      state.loading = true
      try {
        const formData = pick(state, 'username', 'password')
        await http.post('/auth/login', formData)

        message.success('登录成功')
      } catch (err) {
        if (axios.isCancel(err)) return
        message.error(err.message)
      } finally {
        state.loading = false
      }
    }

    return {
      state,
      handleSubmit,
    }
  },
  components: {
    'a-form': Form,
    'a-form-item': Form.Item,
    'a-input': Input,
    'a-button': Button,
  },
})
</script>
