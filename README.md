# 好运气的小玩意——Windows版

## 网页版

网页版详见：[网页版](https://thirdh6o.github.io/hyq_works/)  
网页版仓库请移步：[网页版仓库](https://github.com/thirdh6o/hyq_works)

## 🗂️ 项目结构

```text
.
├─ assets/
│  ├─ css/            # 样式文件
│  ├─ js/             # 前端逻辑
│  └─ icons/          # 应用图标（.ico）
├─ pages/             # HTML 页面
├─ index.js           # Electron 主进程入口
├─ package.json
├─ package-lock.json
├─ .gitignore
└─ README.md
```

---

## 🚀 快速开始（开发模式）

### 1️⃣ 克隆仓库

### 2️⃣ 安装依赖

```bash
npm install
```

国内网络环境建议提前设置 npm 镜像：

 ```bash
 npm config set registry https://registry.npmmirror.com
 ```

### 3️⃣ 启动桌面应用（开发模式）

```bash
npm start
```

---

## 📦 打包为 Windows 安装包（exe）

本项目使用 **electron-builder + NSIS** 进行打包。

### 1️⃣（推荐）设置 Electron 下载镜像（国内网络必需）

#### Windows（PowerShell，临时生效）
```powershell
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"$env:ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/"
```


---

### 2️⃣ 构建安装包

```bash
npm run build
```

构建完成后会生成：

```text
dist/
├─ win-unpacked/              # 解压后的可运行目录
└─ Setup.exe    # Windows 安装程序
```

---
