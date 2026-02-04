# NGINX 部署 SPA 刷新 404 问题总结

## 问题现象
- 在浏览器中通过应用内部导航进入子路由（例如 `/file-management`）时页面正常。
- 刷新浏览器或直接访问子路由 URL 时，服务器返回 404。

## 问题原因
- 当前项目使用的是 **history 路由**（非 hash）。
- 刷新时浏览器会向服务器发起对真实路径的请求（例如 `/file-management`）。
- NGINX 默认按静态文件路径查找资源，找不到对应文件就返回 404。
- 这一步发生在前端应用加载之前，因此**前端无法彻底解决**。

## 解决方案（推荐）
在 NGINX 侧配置“SPA 回退”：
- 如果请求路径命中静态资源，就返回该资源。
- 如果未命中任何静态资源，就回退到 `index.html`，交由前端路由解析。

### 方案 A：部署在根路径 `/`
```nginx
server {
  listen 80;
  server_name your-domain.com;

  root /var/www/idealtemplate;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### 方案 B：部署在子路径 `/idealtemplate/`
```nginx
server {
  listen 80;
  server_name your-domain.com;

  root /var/www;
  index index.html;

  location /idealtemplate/ {
    try_files $uri $uri/ /idealtemplate/index.html;
  }
}
```

## 前端侧注意事项
- 构建 `base` 必须与部署路径一致（例如子路径部署需使用 `/idealtemplate/`）。
- 例如 Vite 中通过 `VITE_BASE_URL=/idealtemplate/` 设置。

## 结论
- **彻底解决 SPA 刷新 404 的唯一方式是服务器层回退配置**。
- 前端只能做有限补救（如 GitHub Pages 的 `404.html` 方案），无法替代 NGINX 的回退规则。
