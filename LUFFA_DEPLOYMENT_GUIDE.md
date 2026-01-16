# Luffa SuperBox 部署指南

## 问题说明

你遇到的错误是因为：
1. **WXML编译错误** - Luffa开发工具期望微信小程序格式，而你的项目是React H5应用
2. **__devtoolsConfig未定义** - 这是Vite构建的H5应用，不是小程序原生代码

## 正确的部署方式

### 方案1：纯H5小程序（推荐，最简单）

你的项目是React应用，应该作为**H5小程序**部署：

1. ✅ **已完成**：代码已部署到Vercel
   - URL: `https://rwa-insight-luffa.vercel.app`

2. ✅ **已完成**：在Luffa管理后台配置域名
   - Request: `https://rwa-insight-luffa.vercel.app`
   - H5 page: `https://rwa-insight-luffa.vercel.app`

3. **在Luffa App中测试**
   - 直接在Luffa App打开你的小程序
   - 会以WebView形式加载
   - 不需要使用开发者工具

4. **调试方法**
   - 在浏览器中测试：http://localhost:3000
   - 在Vercel预览：https://rwa-insight-luffa.vercel.app
   - 真机调试：在Luffa App中打开

### 方案2：小程序壳 + H5内容（如果需要）

如果你需要使用Luffa开发工具调试，可以使用我刚创建的小程序wrapper：

**目录结构：**
```
luffa-miniprogram/
├── app.json          # 小程序配置
├── app.js           # 小程序入口
└── pages/
    └── index/
        ├── index.wxml    # 使用web-view加载H5
        ├── index.js
        ├── index.json
        └── index.wxss
```

**使用方法：**
1. 在Luffa开发工具中打开 `luffa-miniprogram` 目录
2. web-view会加载你的Vercel URL
3. 可以在开发工具中预览

## 推荐流程

### 开发阶段
```bash
# 1. 本地开发测试
npm run dev
# 浏览器访问: http://localhost:3000

# 2. 构建生产版本
npm run build

# 3. 预览生产构建
npm run preview
```

### 部署阶段
```bash
# 1. 推送到GitHub（自动触发Vercel部署）
git add .
git commit -m "Update features"
git push

# 2. Vercel自动构建和部署
# 访问: https://rwa-insight-luffa.vercel.app

# 3. 在Luffa App中测试
# 打开小程序即可
```

### 调试阶段

**浏览器调试（推荐）：**
- Chrome DevTools
- React DevTools扩展
- 控制台查看SDK日志

**真机调试：**
- 在Luffa App中打开小程序
- 查看实际运行效果
- 测试钱包连接功能

## 不需要做的事

❌ 不要在Luffa开发工具中打开React项目
❌ 不要尝试编译WXML（你的项目不使用WXML）
❌ 不要上传代码包（H5小程序直接用URL）

## 需要做的事

✅ 确保Vercel部署成功
✅ 在Luffa管理后台配置正确的域名
✅ 在浏览器中测试所有功能
✅ 在Luffa App中测试钱包连接
✅ 查看控制台日志确认SDK工作正常

## 测试清单

### 浏览器测试
- [ ] http://localhost:3000 能正常访问
- [ ] 所有页面都能加载
- [ ] 控制台显示SDK初始化日志
- [ ] Mock钱包连接功能正常

### Vercel测试
- [ ] https://rwa-insight-luffa.vercel.app 能访问
- [ ] 页面加载速度正常
- [ ] 所有静态资源都能加载
- [ ] 没有404错误

### Luffa App测试
- [ ] 小程序能打开
- [ ] 钱包连接提示出现
- [ ] 用户数据正确显示
- [ ] 所有功能正常工作

## 常见问题

### Q: 为什么开发工具报WXML错误？
A: 你的项目是React H5应用，不是微信小程序原生项目。不需要使用开发工具的模拟器。

### Q: 如何调试？
A: 在浏览器中调试（localhost:3000），或者在Luffa App中真机测试。

### Q: 需要上传代码包吗？
A: 不需要。H5小程序只需要配置URL即可。

### Q: 如何更新小程序？
A: 推送到GitHub → Vercel自动部署 → Luffa自动加载最新版本

## 当前状态

✅ React应用已构建
✅ 已部署到Vercel
✅ 域名已配置
✅ SDK已优化
✅ 准备在Luffa App中测试

**下一步：在Luffa App中打开你的小程序，测试钱包连接功能！**

## 小程序Wrapper说明（可选）

如果你想在Luffa开发工具中预览，可以使用我创建的 `luffa-miniprogram` 目录：

1. 在Luffa开发工具中选择"导入项目"
2. 选择 `luffa-miniprogram` 目录
3. 工具会加载小程序壳，里面用web-view嵌入你的H5应用

但**不推荐**这种方式，因为：
- 增加了一层wrapper
- 调试不如直接浏览器方便
- 部署时不需要这个wrapper

**最佳实践：浏览器开发 + Luffa App真机测试**
