# 任务详情权限控制优化设计文档

## 状态

该计划对应的旧问题已经完成清理，原文中关于 `auth-check.js` 和 `profile-*-simple.html` 的实现描述已不再适用。

## 当前做法

- 任务相关页面统一接入正式认证模块
- 登录态由 `auth-state.js` 和 `auth-storage.js` 提供
- 角色访问控制由 `auth-guard.js` 执行
- 导航和页面公共区块通过 `shared-layout.js` 同步登录状态

## 当前原则

- 不再新增 `auth-check.js` 一类平行认证工具
- 不再让 `simple` 页面承担正式业务逻辑
- 页面权限判断应依赖统一认证状态，而不是直接读取零散 localStorage key
