<template>
  <h3>注册</h3>
  <!-- <a-tabs v-model:activeKey="state.activeKey">
    <a-tab-pane key="email" tab="邮箱注册"> -->
  <a-form>
    <a-form-item label="用户名">
      <a-input v-model:value="state.username"></a-input>
    </a-form-item>
    <a-form-item label="邮箱">
      <a-input v-model:value="state.email" type="email"></a-input>
    </a-form-item>
    <a-form-item label="密码">
      <a-input v-model:value="state.password" type="password"></a-input>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" :loading="state.loading" @click="handleSubmit()">
        注册
      </a-button>
    </a-form-item>
    <a-form-item> 已有账号？<a href="/">去登录</a> </a-form-item>
  </a-form>
  <!-- </a-tab-pane>
    <a-tab-pane key="mobile" tab="手机号注册">
      <a-form>
        <a-form-item label="手机号">
          <a-input v-model:value="state.mobile"></a-input>
        </a-form-item>
        <a-form-item label="验证码">
          <a-input v-model:value="state.code">
            <template #addonAfter>
              <a>获取验证码</a>
            </template>
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" :loading="state.loading" @click="handleSubmit()">
            注册
          </a-button>
        </a-form-item>
      </a-form>
    </a-tab-pane>
  </a-tabs> -->
</template>

<script lang="ts">
import axios from 'axios'

import { defineComponent, reactive } from 'vue'
import { Tabs, Form, Input, Button, message } from 'ant-design-vue'

import { pick } from 'lodash-es'

import http from '@/util/http'

export default defineComponent({
  name: 'App',
  setup() {
    const state = reactive({
      activeKey: 'email',
      loading: false,
      username: '',
      email: '',
      mobile: '',
      password: '',
      code: '',
    })

    /**
     * @todo 缺少后续操作：提示激活邮件已发送，请尽快激活，3秒后重定向回原来的地方
     */
    async function createUserWithEmail() {
      const formData = pick(state, 'username', 'email', 'password')
      await http.post('/auth/register', formData)
    }

    async function handleSubmit() {
      state.loading = true
      try {
        const activeKey = state.activeKey
        if (activeKey === 'email') {
          await createUserWithEmail()
        } else {
          message.info('暂不支持手机号注册')
          return
        }

        message.success('注册成功')
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
    'a-tabs': Tabs,
    'a-tab-pane': Tabs.TabPane,
    'a-form': Form,
    'a-form-item': Form.Item,
    'a-input': Input,
    'a-button': Button,
  },
})
</script>
