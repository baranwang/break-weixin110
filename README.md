# break weixin110

突破微信内置浏览器无法访问部分 URL

## 部署

使用 [`vercel`](https://vercel.com/docs/introduction) 自动部署

或

```bash
PORT=80 node .
```

## 使用

下方链接无法保证可用性，推荐自行部署

### Surge 4 

安装模块 https://break-weixin110.vercel.app/surge.sgmodule

### Surge 3

```conf
[URL Rewrite]
^http(s)?://weixin110.qq.com(.*) http://break-weixin110.vercel.app/weixin110.qq.com$2 302

[MITM]
hostname = weixin110.qq.com
```

### Quantumult X

重写中添加引用 https://break-weixin110.vercel.app/quantumult.conf

```conf
[rewrite_remote]
https://break-weixin110.vercel.app/quantumult.conf, tag=Break Weixin110, enabled=true
```