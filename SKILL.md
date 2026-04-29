---
name: 还原figma
description: 把 Figma 设计稿忠实还原到这个 Tauri 2 + React + Tailwind 项目里。不是"看图猜",而是按规范从 Figma MCP 拉颜色/间距/字号,映射到 App.css 的 CSS 变量,所有数值用 Tailwind 响应式写法。Use when 用户提到 "Figma"、"按设计稿"、"还原 UI"、"实现这张图"、贴 Figma 链接、贴设计稿截图,或要求把某个组件/页面对齐设计。
---

# 还原 Figma 的工作流（项目级规范）

适用范围:`scrmemflow/scrpanel`(Tauri 2 + React Router 7 + Tailwind v4 + shadcn)。

## 核心原则

1. **不要看着图猜数值**。所有颜色、字号、间距、圆角、阴影都从 Figma MCP 拉变量定义,不要从截图肉眼估。
2. **颜色必须走 CSS 变量**,不能 hardcode 十六进制色值在 className 里。优先用 `scrpanel/app/App.css` 已有的 token,找不到对应的就**新建**(同时给 dark 模式占位)。
3. **所有 px 数值必须 Tailwind 响应式**。Figma 默认是桌面 1440 宽,但本 app 窗口可缩放(`minWidth: 922`),所以 padding/gap/字号/图标/圆角都要至少给一个小屏断点。
4. **改 UI 前先读相关文件**(CLAUDE.md 强制),理解现有实现方式再动手。
5. **测试不通过不能 commit**。

## 操作步骤

### 1. 从 Figma 拉规范(不是看截图)

按这个顺序调 MCP:

```
mcp__figma-desktop__get_metadata        # 看节点 id / 层级 / 尺寸
mcp__figma-desktop__get_design_context  # 拿完整 React+Tailwind 参考代码 + 图片资源 url
mcp__figma-desktop__get_variable_defs   # 拿这个节点用到的 design token 名 + 实际值
mcp__figma-desktop__get_screenshot      # 视觉确认
```

如果 Figma 提示要做 Code Connect 映射,按它给的脚本**原样**转达给用户;用户拒绝或没回就用 `forceCode: true` 直接拉代码。

`get_design_context` 偶尔会 timeout — 重试 1 次,再不行只用 metadata + variable_defs + screenshot,不要硬等。

### 2. 颜色 → CSS 变量映射

**核心规则:不要把 Figma 的 Semi Design token 名照搬进 className。**

Figma `get_design_context` 导出的代码里会带一堆 `var(--semi-color-text-0)` `var(--semi-grey-1)` `var(--semi-border-radius-large)` 这种 Semi Design 命名 —— 本项目 App.css **没有这些变量**,直接拷进来 className 里 var() 会找不到、CSS 属性整个失效(border 看不出来、文字变默认色)。

正确做法:**先看 Figma 给的实际值(从 `get_variable_defs` 拿),再用值在 App.css 里反查项目 token,落地到 className 里只用项目自己的 `--luci-*` / `--text-*` / `--bg-*` / `--grey-*` / `--app*` 命名。**

常见 Semi → 项目 token 映射(按值反查的结果):

```
Figma Semi 命名                            实际值              本项目 token
─────────────────────────────────────────────────────────────────────────────
usage/text/--semi-color-text-0          = #201f26          → --text-0 / --luci-text-subtle
usage/text/--semi-color-text-1          = #201f26 / 80%    → --text-1 / --luci-text-tertiary
usage/text/--semi-color-text-3          = #201f26 / 35%    → --text-3 / --luci-text-muted
usage/bg/--semi-color-bg-0              = #ffffff          → --luci-surface-bg / --luci-surface-tile
usage/bg/--semi-color-white-PIN         = #ffffff          → --luci-surface-bg
usage/App/--semi-color-APP              = #ef6915          → --luci-link
app3                                    = #ff9f1c          → --app3 / --luci-accent
palette/grey/--semi-grey-0              = #f9f9f9          → --grey-0 / --bg-0
palette/grey/--semi-bg-PIN              = #f0f0f0          → --luci-surface-soft / --luci-rail-bg
palette/grey/--semi-grey-1              = #ecedef          → --luci-border / --luci-surface-strong
palette/grey/--semi-grey-2              = #e7e7ea          → --luci-border-strong / --grey-1
palette/grey/--semi-grey-3              = #a9a8b1          → (无,新建 --luci-grey-3)
corner/--semi-border-radius-large       = 12               → rounded-xl
corner/--semi-border-radius-medium      = 8                → rounded-[8px]
corner/full                             = 2250(任意大数)    → rounded-full
```

**找色的固定流程(每次都走):**
1. `get_variable_defs` 拿 Figma 这个节点用到的 token 名 + 实际值。
2. **忽略 Semi 的命名**(`--semi-*` / `palette/*` / `usage/*` / `corner/*`)—— 它们只是 Figma 自己的 design system,不存在于本项目 CSS 里。
3. 拿实际值(`#ecedef` `#ff9f1c` `12` 这种)去 `scrpanel/app/App.css` 里搜。
4. 命中 → 用 `var(--luci-...)` / `var(--app3)` 等本项目 token。
5. 没命中 → **新建变量**(同时给 `[data-theme="dark"]` 占位),命名遵循现有前缀:
   - `--luci-` 前缀:UI 表面/边框/语义色
   - `--text-` / `--bg-` / `--grey-` 前缀:基础 token
   - `--app*` 前缀:已有的 brand/accent 命名空间(如 `--app3`)
6. **不要**在 className 里出现 `var(--semi-*)` `var(--palette-*)`,这是判断有没有走流程的硬性标志。

**写 className 时的禁忌:**

```
❌ border-[var(--semi-grey-1)]         项目里没这个变量,边框失效
❌ bg-[var(--semi-color-bg-0)]         同上
❌ rounded-[var(--corner-full)]        Semi 的 corner token 不在项目里
❌ bg-[#ff9f1c]                        hardcode hex,违反 token 规则
❌ text-[#201f26]/80                   同上

✅ border-[var(--luci-border)]         项目 token,light/dark 自动切换
✅ bg-[var(--app3)]                    brand 色,与 Figma app3 token 对齐
✅ rounded-full                        Tailwind preset
✅ text-[var(--text-1)]                项目 token,自带 80% 透明度
```

**遇到 `var(--semi-*)` 当 fallback 写法的反模式:**

`border-[var(--semi-grey-1,#ecedef)]` 这种"带 Semi 名 + hex fallback"的写法看起来"安全",但仍然是错的:linter/格式化工具可能去掉 fallback,留下空 var() 失效。一律用项目 token,**不写 Semi 名作为主名,即使有 fallback**。

### 3. 尺寸/字号/间距 → Tailwind 响应式

Figma 给的 px 默认对应 1440 宽桌面。本项目最小窗口 922 宽,基本所有 layout 都会经历 ~64% 缩放。规则:

- **大尺寸(≥24px)**: 写两档,默认是小屏值,`md:` 加桌面值。
  - 例:Figma `width: 216px` 的 sidebar → `className="w-[180px] md:w-[216px]"`
  - 例:Figma 顶部 `height: 64px` → `h-12 md:h-16`
- **中等(12–24px)**: padding/gap,大多数情况下不需要分档,直接用一档。如果在窄屏明显不舒服才加 `md:`。
  - 例:`px-3 md:px-4`(Figma 16 → 默认 12 / 桌面 16)
- **小尺寸(<12px)**: 字号、icon size、border-radius 一般不分档,直接 `text-sm` `h-5 w-5` `rounded-lg`。
- **字号**: 用 Tailwind preset(`text-xs/sm/base/lg/xl`),只有在 preset 没有合适值时才用 `text-[14px]`。如果是 14px → `text-sm`,16px → `text-base`,12px → `text-xs`。
- **行高**: 跟字号绑定,Figma 14/20 = Tailwind `text-sm leading-5`。

**断点**: 这个项目 Tailwind 默认 `sm: 640` `md: 768`。窗口最小 922,所以**默认值就是 ≥922 的小屏**,`md:` 是 ≥1024 的舒适区,`lg:` 是 ≥1280 的标准桌面。一般两档(默认 + `md:` 或 + `lg:`)就够了。

### 4. SVG / 图标

按 CLAUDE.md 优先复用现有资源 `scrpanel/app/v2/assets/figma/**`:

- 先 `find` 同语义图标(`nav-*` `icon-*`)。
- 现有 SVG 染色:用 CSS `mask-image`(SVG 当 mask、`background-color` 控色)。**不要**用 `filter` 试图变成任意颜色 — 只能黑/白。
- 没有匹配的就用 `lucide-react`(已是依赖)。
- 实在都没有,从 Figma 导出再加进 `assets/figma/<page>/`。

### 5. 字体

设计稿主字体 `Manrope` 已在 App.css 的 @font-face 里。直接 `style={{ fontFamily: "Manrope, sans-serif" }}`,或者用项目里已有的 utility class。

### 6. 阴影 / 圆角

- Figma `shadow: 0 0 6px rgba(0,0,0,0.1)` → `shadow-[0_0_6px_rgba(0,0,0,0.1)]`,但能用 `var(--luci-panel-shadow)` 就用变量。
- 圆角:`--semi-border-radius-large = 12` → `rounded-xl`(12 在 Tailwind 是 xl)。Figma 18 → `rounded-[18px]`(没有对应 preset)。

### 7. macOS 红绿灯 / 标题栏

主窗口 `tauri.conf.json` 已配 `titleBarStyle: "Overlay"` + `hiddenTitle: true` + `trafficLightPosition`。要点:

- **不要给主窗口设 `transparent: true`** — macOS 透明窗口不会正常绘制 traffic-light,失焦会消失。
- 红绿灯落在 webview 之上,前端只需要在 sidebar 顶部留出 `pl-[68px]` 这种的左侧占位。
- 调位置就改 `trafficLightPosition.{x,y}`,改完**必须重启 Tauri**(conf.json 不热更新)。

### 8. 验证

依次跑:

```sh
cd scrpanel && bun run typecheck
cd scrpanel && bun run tauri dev   # 视觉对照 Figma
```

UI 改动 typecheck 过了**还不够**,必须跑起来对照 Figma 截图看。如果是 Tauri 桌面应用我没法直接验证,**告知用户去 `bun run tauri dev` 看效果**,具体看哪几个点(颜色/位置/响应式断点)。

### 9. 改架构 / 删代码 / 拿不准 UI 交互时

CLAUDE.md 强制:用 `AskUserQuestion` 工具问,不要自己拍板。

## 反模式(不要做)

- 在 className 里 hardcode `#ff9f1c` `#e7e7ea` 这种十六进制 — 必须走 var。
- 在 className 里写 `var(--semi-grey-1)` `var(--semi-color-text-0)` `var(--corner-full)` 这种 Figma Semi Design 命名 — 项目里**没有**这些变量,会导致 CSS 属性失效。必须按值反查项目 token,用 `var(--luci-*)` / `var(--text-*)` / `var(--app*)`。
- 写 `var(--semi-grey-1, #ecedef)` 这种"Semi 名 + hex fallback"组合 — 看似安全,linter/格式化会去 fallback,留下空 var() 失效。一律用项目 token,**不写 Semi 名作为主名**。
- 单档写 `w-[216px]` `text-[14px]` 一刀切桌面值,不考虑 922 窄屏。
- 看截图肉眼估色 — 必须 `get_variable_defs` 拿真值。
- 为了"忠实还原"复制 Figma 给的全部内联 className 到代码里 — Figma 导出的是 "react+tailwind 草稿",本项目有 token 系统,要翻译。
- 新建 CSS 变量只在 light 加,不在 dark 加 — 会有暗色裸露 bug。
- 改完 conf.json 不重启 Tauri 就说"已完成"。

## 一个完整例子

需求:还原 Figma 选中的 sidebar 卡片,顶部 46px 留白给红绿灯,下面是 logo + 三个菜单。

```
1. metadata → 选中节点是 leftbar, 216×868
2. variable_defs → 拿到 grey-0 #f9f9f9 / grey-1 #e7e7ea / app3 #ff9f1c / text-1
3. design_context → 拿到完整结构 + asset url
4. App.css 搜 #ff9f1c → 命中 --luci-accent ✓
5. App.css 搜 #e7e7ea → 命中 --luci-border-strong ✓
6. width 216 → 小屏 200, 桌面 216 → w-[200px] md:w-[216px]
7. height 46 顶部行 → 一档 h-[46px](高度变化破坏布局对齐)
8. 圆角 18 → rounded-[18px]
9. 阴影 0 0 6px / 10% → shadow-[0_0_6px_rgba(0,0,0,0.1)]
10. 顶部行 pl-[68px] 留红绿灯位
11. 复用 nav-ask-luci.svg 当 mask + bg-color 切换 active 橙色 / inactive text-1
12. 跑 typecheck → 让用户 tauri dev 视觉验证
```
