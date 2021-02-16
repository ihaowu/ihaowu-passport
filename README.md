# ihaowu 认证中心

[![lang](https://img.shields.io/badge/lang-typescript-informational)](https://www.typescriptlang.org/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)][prettier]
![License](https://img.shields.io/badge/license-MIT-brightgreen.svg)

基于 [nestjs][nestjs] 和 [vue.js][vue3] 搭建的授权认证服务。

## 目录结构

```bash
Project/
├── .vscode/
├── apps/                    --- 独立应用
|   ├── api/
|   └── web/
├── libs/                    --- 业务模块
├── tools/                   --- 工程模块
├── lerna.json
├── tsconfig.base.json       --- 全局基础配置
├── tsconfig.ui.json         --- vue3 公共组件配置
├── tsconfig.json
└── vscode.code-workspace
```

## 快速启动

### 创建 `.env` 文件

将根目录的 `.env.example` 改为 `.env`，根据里面的内容修改。

### 启动项目

注意启动项目前，必须先全局安装 `yarn` 和 `lerna` 模块。

项目强依赖 `redis`，启动项目前需要提前准备好服务。

```shell
# 安装依赖
$ yarn bootstrap

# 启动工程
$ yarn start
```

> **注意：** 项目使用的数据库是 `sqlite` 数据库，如需切换其他，请修改 `apps/api/prisma/schema.prisma`。

### 导入示例数据（非必须）

项目准备了演示用的示例数据，可以直接使用命令导入到数据库，如果需要演示推荐导入测试数据。

```shell
# 导入示例数据
$ yarn demo
```

**测试账号**

- 管理员: admin/123456
- 普通账号: demo/123456

## 待办列表

- [x] 支持本地账号注册/登录
- [x] 支持邮件激活注册/登录
- [ ] 支持短信验证码注册/登录
- [ ] 支持任意设备扫码登录
- [ ] 支持第三方账号授权/解绑定
- [ ] 支持 OpenID Connect (OIDC) 提供商登录
- [ ] 支持单点登录(SingleSignOn，SSO)服务
- [x] 使用 swagger 自动生成文档
- [ ] 完整的前端界面

## 感谢

以下排名不分先后。

- [lerna][lerna]
- [vue.js][vue3]
- [nestjs][nestjs]
- [vitejs](https://vitejs.dev/)
- [swagger][swagger]
- [typescript](https://www.typescriptlang.org/)
- more

## 授权协议

- MIT

[lerna]: https://lerna.js.org/
[vue3]: https://v3.vuejs.org/
[nestjs]: https://nestjs.com/
[prettier]: https://prettier.io/
[swagger]: https://swagger.io/
