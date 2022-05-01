# 采用 Node.js -> Koa.js 开放API

### Node.js install 

```bash
  # Using Debian, as root
  curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
  apt-get install -y nodejs
```

### 环境变量
| Name             | Description    | Default                                                      |
| ---------------- | -------------- | ------------------------------------------------------------ |
| APP_PORT         | 运行端口       | 8080                                                         |
| MINIO_CFG_BASE64 | MINIO 相关配置 | W3siZW5kUG9pbnQiOiJzYW5kYm94Lm9zcy1jbi1zaGFuZ2hhaS5hbGl5dW5jcy5jb20iLCJwb3J0Ijo4MCwidXNlU1NMIjpmYWxzZSwiYWNjZXNzS2V5Ijoia2V5Iiwic2VjcmV0S2V5Ijoic2VjcmV0IiwicmVnaW9uIjoib3NzLWNuLXNoYW5naGFpIiwiYnVja2V0Ijoic2FuZGJveCIsIm5hbWUiOiJhc3NldCJ9XQ== |
|                  |                |                                                              |
