# 历史 0-1 题库

这里记录已经实际创建过的首轮题面，后续出题会同时读取本文件和 SQLite，避免重复业务对象、数据模型、核心算法与交互结构。

<!-- task-entry-start {"run_id":"bc2f39a1fa49","repo_name":"api-change-radar","task_type":"0-1 代码生成"} -->
## 历史记录 · api-change-radar

- 创建时间：2026-09-08 17:39:02 +0800
- 项目类别：全栈
- 任务难度：未记录
- 语言/框架：TypeScript、SQLAlchemy、FastAPI、SQLite、React、Python、Vite

### User Prompt

<!-- prompt-start -->
从零实现一个名为 API Change Radar 的本地全栈应用，用来比较两份 OpenAPI 文档并判断接口变更影响。请直接完成可运行产品，不要只写方案。 技术栈：后端使用 Python 3、FastAPI、SQLAlchemy 和 SQLite；前端使用 React、TypeScript 和 Vite。仓库根目录清晰划分 backend、frontend，并提供完整的 README 运行说明。 功能要求： 1. 支持粘贴或上传两份 OpenAPI 3.x JSON/YAML，分别作为基线版本和候选版本；解析失败时显示具体位置和原因。 2. 自动比较 paths、HTTP 方法、参数、requestBody、responses，以及 schema 的 required、type、enum 变化，并区分破坏性变更、非破坏性变更和仅文档变化。 3. 结果页按严重级别动态统计，支持搜索和筛选；详情中展示变更前后内容、字段位置和判断依据。 4. 每次比较都保存为不可变快照到 SQLite，可查看历史记录；后续规则配置变化不能改变历史结果。 5. 规则中心的数据由后端统一提供，支持启用和停用，并把配置保存到 SQLite；系统至少保留一条启用规则。新比较只运行当前启用规则。 6. 支持对单条结果添加风险豁免，记录原因、负责人和时间，并可撤销；规则切换不能影响已有豁免。 7. 首次启动时写入两组示例文档和一组默认规则，页面提供一键载入示例，能完整走通比较流程。 8. 页面风格简约现代，适配桌面和移动端，补齐空状态、加载状态、成功反馈和错误提示。 质量要求： - 后端补充比较逻辑、快照持久化、至少保留一条启用规则、风险豁免不受规则切换影响等测试。 - pytest -q 和 npm run build 均能通过。 - 不依赖付费外部服务，不保留 TODO、占位实现或只用于演示的假接口。 - 完成后自行检查关键流程，并提交所有代码。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "d511c9cb1ddd", "repo_name": "reliable-event-relay", "task_type": "0-1 代码生成"} -->
## 0001 · reliable-event-relay

- 创建时间：2026-09-09 19:16:29 +0800
- 项目类别：纯后端
- 任务难度：地狱
- 语言/框架：Docker, Python 3.12, FastAPI, SQLAlchemy, PostgreSQL, Docker Compose, pytest

### User Prompt

<!-- prompt-start -->
项目编号 0001。从空仓库实现一个纯后端的可靠事件投递中继服务，使用 Python 3.12、FastAPI、SQLAlchemy 和 PostgreSQL，并通过 Docker Compose 启动 API、投递工作进程和数据库，不得创建任何前端或依赖外部在线服务。调用方可以注册仅允许指向 Compose 内部网络的 HTTP 目标端点，并向某个目标提交带有业务事件键、事件类型和 JSON 载荷的投递任务；同一目标与业务事件键的重复提交必须通过数据库唯一约束实现幂等，并返回首次创建的任务而不能产生重复投递。API 与工作进程共享持久化状态，工作进程需要支持多个副本并发领取任务，必须利用 PostgreSQL 行锁或等价的原子租约机制保证同一轮尝试不会被两个进程同时执行，同时确保同一目标下的任务按创建顺序投递，某条任务尚未成功或进入死信前不得越过它投递后续任务，不同目标之间则允许并行。每次请求必须发送事件标识、尝试编号、时间戳和使用目标密钥计算的 HMAC 签名；目标返回 2xx 时标记成功，返回 408、429、5xx、连接失败或超时时按指数退避重试并加入可配置抖动，其他 4xx 直接进入死信，达到最大尝试次数也进入死信，并完整保存每次尝试的起止时间、状态码、错误分类和下一次执行时间，但不得保存密钥明文。租约过期的任务应能被其他工作进程安全接管，进程在发出请求后崩溃所造成的重复投递必须在 README 中明确说明为至少一次语义，并通过稳定的事件标识帮助接收方去重。提供查询任务及尝试历史、暂停和恢复目标、轮换目标密钥、人工重放死信任务以及健康检查接口；暂停目标时不得领取新任务，恢复后应继续原有顺序，重放必须创建新的投递周期并保留旧尝试记录，正在投递或已经成功的任务不可重放。所有写接口都要校验输入并返回结构一致、可定位问题的 JSON 错误，数据库不可用、目标地址越界、非法状态转换和并发冲突必须有明确失败路径；目标地址需阻止访问 Compose 网络之外的主机以及云元数据地址，并防止通过重定向绕过限制。仓库中需包含一个只用于集成测试且行为可配置的本地接收服务，以验证成功、签名、超时、限流、永久失败和重试场景，它不能以固定结果冒充核心功能。为关键状态转换、幂等竞争、多工作进程抢占、严格顺序、租约恢复、退避边界、暂停恢复、密钥轮换和死信重放编写单元及集成测试；时间与随机抖动应可注入，使测试稳定且无需真实等待。提交完整的 Dockerfile、compose.yaml、数据库迁移、README、测试和 .gitignore，README 要说明架构、状态机、至少一次投递语义、配置、接口示例以及构建运行和测试方法，所有容器应以非 root 用户运行并提供健康检查，项目中不得留下 TODO、假数据接口、固定结果或未实现分支。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "15cbc6b37130", "repo_name": "offline-evacuation-planner", "task_type": "0-1 代码生成"} -->
## 0002 · offline-evacuation-planner

- 创建时间：2026-09-09 19:53:14 +0800
- 项目类别：纯前端
- 任务难度：困难
- 语言/框架：Docker, TypeScript, React, Vite, Zustand, IndexedDB, Web Worker, Vitest, Testing Library, Playwright

### User Prompt

<!-- prompt-start -->
从空仓库实现一个离线优先的建筑疏散编排器，使用 React、TypeScript、Vite、Zustand 与 IndexedDB，在浏览器中导入建筑平面 SVG，识别可通行区域、出口和障碍，并允许在画布上设置起点、封锁区、单向通道及出口容量；禁止创建业务后端或调用任何外部在线服务。应用需在 Web Worker 中计算多起点疏散方案，路径必须避开封锁并遵守单向约束，出口容量冲突按稳定规则分配，同时说明无法疏散的原因。计算期间允许继续编辑，旧任务结果不得覆盖新版本，用户可取消任务；Worker 崩溃、超时、SVG 非法或无可行路径时须显示可恢复错误。编辑采用可撤销、重做的命令历史，批量操作视为一次事务；方案、输入版本和计算参数持久化到 IndexedDB，刷新后恢复，跨标签页使用 BroadcastChannel 协调写入，通过修订号和明确的冲突处理防止静默覆盖。支持导出包含原始 SVG、约束、结果及校验摘要的 JSON 包并离线重新导入；导入必须校验格式版本、结构和摘要，失败不得污染已有数据。界面应支持缩放平移、键盘操作、可见焦点和移动端查看，并呈现空闲、计算中、结果过期、成功、部分成功及失败状态。使用 Vitest、Testing Library 和 Playwright 覆盖路径约束、容量竞争、任务取消竞态、事务撤销、持久化恢复、跨标签冲突及损坏导入。提交 Dockerfile、compose.yaml、README、测试和 .gitignore；README 说明架构、算法取舍、数据版本、并发策略及运行测试方法，容器须以非 root 用户运行并提供健康检查，不得留下 TODO、假数据接口、固定结果或未实现分支。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "8f7b2f40f0d6", "repo_name": "tamper-evident-calibration-ledger", "task_type": "0-1 代码生成"} -->
## 0004-1 · tamper-evident-calibration-ledger

- 创建时间：2026-09-10 00:13:35 +0800
- 项目类别：纯后端
- 任务难度：待评估
- 语言/框架：Docker, Python 3.12, FastAPI, SQLAlchemy, PostgreSQL, Alembic, RFC 6962 Merkle Tree, HMAC, pytest

### User Prompt

<!-- prompt-start -->
新增“仪器审计包”模块，使审计员能为指定 instrument_id 创建一次可追踪的离线导出任务。POST /v1/audit-packages 接收 instrument_id、幂等键和可选截止检查点，创建 pending 任务并固定已封存边界；未指定检查点时选取最新检查点，没有可用封存或检查点不覆盖该仪器事件时返回结构化错误，重试相同幂等键不得重复建包，不同参数复用键返回冲突。独立 worker 以事务锁抢占任务，按数据库序号收集边界内该仪器的全部事件，为每个事件生成现有格式的收据与证明，并生成含任务、边界、事件数量及文件 SHA-256 的规范化清单，最终写出确定性 ZIP；包内不得出现原始报告或 HMAC 密钥。任务须具有 pending、building、ready、failed 状态及失败原因、尝试次数和产物摘要，崩溃后超时的 building 可被重新领取，失败任务可经 POST /v1/audit-packages/{id}/retry 恢复且不得改变固定边界。提供状态查询和仅在 ready 时可用的下载接口，未完成下载返回明确冲突，未知任务返回既有错误信封。通过 Alembic 增加表、约束和索引，保持事件与检查点只追加不变量及现有 API 兼容；扩展 Compose 启动非 root 导出 worker并加入健康检查。端到端测试须覆盖创建、幂等冲突、封存边界隔离、确定性归档、包内逐条离线验证、双 worker 抢占、崩溃回收、失败重试、下载状态与数据库故障映射，并断言同一输入重建所得 ZIP 字节及摘要一致。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "55e53ae99b73", "repo_name": "prop-scene-console", "task_type": "0-1 代码生成"} -->
## 0006 · prop-scene-console

- 创建时间：2026-09-10 00:10:24 +0800
- 项目类别：全栈
- 任务难度：待评估
- 语言/框架：Docker, Go, Gin, GORM, PostgreSQL, Svelte, TypeScript, Vite, Server-Sent Events

### User Prompt

<!-- prompt-start -->
密室营业中途，道具门偶尔只回“已收到”却没有真正到位，店员连续点击开门，还可能让后到的复位指令被旧动作反超。请从空仓库实现本地道具场景控制台：后端采用 Go、Gin、GORM 与 PostgreSQL，前端采用 Svelte、TypeScript、Vite，以真实 API 和 Server-Sent Events 联调；Docker Compose 同时运行可配置的设备模拟器，README、.gitignore、Go test、Vitest 和 Playwright 及早验证协议，禁止 TODO、固定响应、假接口和未实现逻辑，错误须区分拒绝、超时与设备故障。技术员导入描述设备能力、互斥组和安全前置条件的 YAML 场景，校验后发布不可变版本；值班员通过平面按钮触发开门、落锁、亮灯或复位，后端为每台设备串行发出带序号的命令，只有收到匹配确认与最终状态才完成，并实时呈现执行轨迹。多设备动作按顺序推进，任一步失败便反向补偿已完成步骤，补偿失败则锁住该场景等待人工核验。模拟器可制造迟到确认、断连和错误状态；服务重启后应从持久化步骤继续查询或补偿，旧确认不得推进新命令。最终可观察正常场景完整到位、故障场景明确回滚，以及不确定设备被隔离后其他无关场景仍可操作。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "27110bf5145a", "repo_name": "cold-chain-trace-ingestor", "task_type": "0-1 代码生成"} -->
## 0007 · cold-chain-trace-ingestor

- 创建时间：2026-09-10 00:49:21 +0800
- 项目类别：纯后端
- 任务难度：待评估
- 语言/框架：Docker, Go 1.24, Fiber, PostgreSQL, Docker Compose

### User Prompt

<!-- prompt-start -->
一批冷链记录仪在运输结束后集中回收，其中既有重复导出的文件，也有断电造成的半帧数据和跨日回拨的设备时钟，质量人员必须先得到可信温度轨迹才能判断是否放行。请从空仓库实现纯后端服务，使用 Go、Fiber 与 PostgreSQL，不创建前端或调用外部在线服务；Docker Compose 运行 API、解析 worker 和数据库，并在开发过程中配套 README、.gitignore、健康检查及 Go 测试，所有输入错误返回结构化反馈，禁止 TODO、固定响应、假接口或未实现分支。API 接收二进制导出文件、设备编号、运输批次和期望时区，上传时流式计算摘要并按摘要幂等去重，不得把整文件读入内存。worker 按文件偏移保存解析检查点，校验帧头、长度、CRC、序号和时间，进程中断后从最后完整帧继续；损坏帧应记录字节位置并隔离整份文件，人工确认后可从指定合法边界重试。成功归并时按稳定规则消除重叠采样，计算超温区间及最长连续超温，只有完整文件才能原子发布批次结论。验收时可观察重复上传返回同一资源，截断文件不产生部分结论，重启 worker 后继续推进，而含时钟回拨的数据给出可定位的异常区间。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "2e91aed240b2", "repo_name": "redaction-rule-lab", "task_type": "0-1 代码生成"} -->
## 0008 · redaction-rule-lab

- 创建时间：2026-09-10 02:01:17 +0800
- 项目类别：纯前端
- 任务难度：待评估
- 语言/框架：Docker, TypeScript, Vue 3, Vite, Vitest, Playwright

### User Prompt

<!-- prompt-start -->
合同附件外发前，姓名、邮箱和证件号可能被多条规则同时命中，简单替换会重复遮蔽、错位，甚至把未处理的敏感片段带出浏览器。请从空仓库实现纯前端实验台，采用 Vue 3、TypeScript 与 Vite，只接受粘贴文本、本地 TXT 和本地 JSON 规则，不创建业务后端或连接在线服务。Docker Compose 应能启动静态应用；在规则解析、区间裁决和导出链路旁配置 Vitest 与 Playwright，README 解释规则格式和安全边界，.gitignore 排除本地产物，所有错误给出规则编号或字符位置，禁止 TODO、假接口、固定响应和占位实现。每条规则包含名称、正则、优先级、替换模板及是否为导出前必检项；引擎先收集原文上的全部命中，再按优先级、区间长度和规则顺序稳定裁决重叠，禁止基于已替换文本继续匹配。界面并排展示原文与结果，点击任一遮蔽块可查看来源规则、原始范围和裁决原因，并支持逐条启停后重新计算。非法正则、零长度匹配、声明编码无法读取或必检模式仍残留时不得污染上一份有效结果，也不得导出；通过检查后生成脱敏文本和审阅清单，两者记录的区间、规则及替换内容必须逐项对应。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "361d6acd147e", "repo_name": "tactile-sign-preflight", "task_type": "0-1 代码生成"} -->
## 0009 · tactile-sign-preflight

- 创建时间：2026-09-10 02:04:29 +0800
- 项目类别：全栈
- 任务难度：待评估
- 语言/框架：Docker, Python 3.12, FastAPI, React, TypeScript, Vite

### User Prompt

<!-- prompt-start -->
无障碍标牌进入压印机前，底图上的螺孔、边框和禁印区常与盲文触点争抢毫米级空间，肉眼预览正常也可能造成触点粘连或越界。请从空仓库实现一套全栈制版预检台，前端采用 React、TypeScript 与 Vite，后端采用 Python 3.12、FastAPI；两端通过真实 API 联调，Docker Compose 启动应用与数据库。制版员上传本地 SVG 底图，填写板材尺寸、盲文文本、行距、点径及安全间距；服务端安全解析 SVG，统一单位与坐标变换，将文本编码为触点几何，再确定性检查触点之间、触点与边框、螺孔及禁印区的距离。README 在坐标约定旁说明支持范围，pytest、Vitest 与 Playwright 覆盖编码、几何边界和联调，.gitignore 排除产物；错误必须带元素编号、坐标和规则阈值，禁止 TODO、假接口、固定响应或占位实现。界面叠加显示底图、触点和冲突连线，点击问题可定位双方；非法 SVG、不支持的变换或任一冲突都不得替换上一份有效预览，也不得生成生产文件。全部通过后可导出坐标已归一化的生产 SVG 与对应问题清单；相同输入应得到相同坐标和内容，验收最终能看到合格版面可下载，而越界触点被明确标红并阻断压印。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "94c1a22164e1", "repo_name": "transmitter-config-switch", "task_type": "0-1 代码生成", "project_category": "纯后端", "language_framework": "Docker, Java 21, Spring Boot 3, Spring Data JPA, PostgreSQL, Flyway, Docker Compose, JUnit 5", "summary": "广播站交班时，两名工程师可能同时发布发射机参数；若后写覆盖先写，频率和功率会组合成未经审核的配置。 … 参数或目标修订非法、期望值过期时均不得改变运行参数，错误须定位"} -->
## 0014 · transmitter-config-switch

- 创建时间：2026-09-10 11:02:57 +0800
- 项目类别：纯后端
- 任务难度：待评估
- 语言/框架：Docker, Java 21, Spring Boot 3, Spring Data JPA, PostgreSQL, Flyway, Docker Compose, JUnit 5

### User Prompt

<!-- prompt-start -->
广播站交班时，两名工程师可能同时发布发射机参数；若后写覆盖先写，频率和功率会组合成未经审核的配置。从空仓库实现纯后端配置切换服务，使用 Java 21、Spring Boot 3、Spring Data JPA、PostgreSQL 与 Flyway，并提供 Dockerfile、compose.yaml、README、.gitignore 和 JUnit 5 测试；Compose 包含名为 verify 的一次性验收服务，API 宿主端口可由 API_PORT 覆盖。客户端提交完整快照：频率为 87.5 至 108.0 MHz 且按 0.1 MHz 步进，功率为 0.1 至 50.0 kW，调制度为 0 至 100 的整数，区间均含端点。合法快照只生成该发射机从 1 开始递增的修订，不自动生效。激活请求必须携带 target_revision、expected_revision 和幂等键；目标修订必须已存在、属于同一发射机且尚未生效。首次尚无生效配置时 expected_revision 必须为 0，此后必须等于当前生效修订；服务在单次数据库事务中将指定目标修订切换为唯一生效版本。两个并发激活使用同一期望值时只能一个成功，另一个返回 409 及最新生效修订。相同幂等键和相同请求内容重试返回原结果，异义复用返回 409。参数或目标修订非法、期望值过期时均不得改变运行参数，错误须定位
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "0a714f0a2165", "repo_name": "subtitle-handoff-line", "task_type": "0-1 代码生成", "project_category": "纯前端", "language_framework": "TypeScript, Vue 3, Vite, Pinia, Vitest, Playwright, Docker, Docker Compose", "summary": "彩排前十分钟，字幕文件中一处毫秒级重叠就会让播控器同时显示两句台词，过短空隙也会妨碍换句辨认。 … Docker Compose 发布端口可由 WEB_PORT 覆盖，并提供 verify 一次性验收服务；Vitest 与 Playwright 覆盖"} -->
## 0015 · subtitle-handoff-line

- 创建时间：2026-09-10 11:06:35 +0800
- 项目类别：纯前端
- 任务难度：待评估
- 语言/框架：TypeScript, Vue 3, Vite, Pinia, Vitest, Playwright, Docker, Docker Compose

### User Prompt

<!-- prompt-start -->
彩排前十分钟，字幕文件中一处毫秒级重叠就会让播控器同时显示两句台词，过短空隙也会妨碍换句辨认。请从空仓库实现纯前端“字幕交接线”，供演出字幕播控员导入和修订字幕；使用 TypeScript、Vue 3、Vite 与 Pinia，处理全部留在浏览器，不建立业务后端或访问外部在线服务。输入为本地 UTF-8 WebVTT：首行必须是 WEBVTT，可带 BOM；字幕块仅允许可选十进制编号、HH:MM:SS.mmm --> HH:MM:SS.mmm 时间行及至少一行非空文本，小时固定两位，分秒限 00 至 59，结束须晚于开始，不支持注释、样式和定位参数。格式解释须采用现成 WebVTT 解析库，不得自行实现或改写解析算法；仅在库输出上校验上述子集。按文件顺序裁决相邻字幕：重叠 1 毫秒即为错误，间隔 0 至 79 毫秒为过密，80 毫秒及以上通过。界面提供导入、表格编辑、问题定位和规范化导出；非法导入不替换当前有效时间轴，非法编辑拒绝提交，并显示首个错误的行号或字幕编号。存在重叠或过密时禁止导出并聚焦首项问题。通过后导出 UTF-8 无 BOM、LF 换行、无编号、时间码固定三位毫秒、块间恰一空行且末尾一个换行的文件，文本内容与顺序不变。Docker Compose 发布端口可由 WEB_PORT 覆盖，并提供 verify 一次性验收服务；Vitest 与 Playwright 覆盖
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "4831244fd2d1", "repo_name": "port-laytime-adjudicator", "task_type": "0-1 代码生成", "project_category": "纯后端", "language_framework": "Python 3.12, FastAPI, SQLAlchemy, PostgreSQL, Alembic, pytest, Docker, Docker Compose", "summary": "散货船离港后，港方与船东常因多段停机时间重叠、越界或恰好相接而算出不同滞期费，结算员需要由同一套边界规则得到可复核结果。 … 验收可直接观察重复覆盖的停机只扣除一次、跨界停机仅扣交集，而非法请求返回具体路径且查询不到结算结果。"} -->
## 0017 · port-laytime-adjudicator

- 创建时间：2026-09-10 11:18:14 +0800
- 项目类别：纯后端
- 任务难度：待评估
- 语言/框架：Python 3.12, FastAPI, SQLAlchemy, PostgreSQL, Alembic, pytest, Docker, Docker Compose

### User Prompt

<!-- prompt-start -->
散货船离港后，港方与船东常因多段停机时间重叠、越界或恰好相接而算出不同滞期费，结算员需要由同一套边界规则得到可复核结果。从空仓库实现 Python 3.12、FastAPI、SQLAlchemy 与 PostgreSQL 的纯后端服务；Docker Compose 发布的宿主端口须由 API_PORT 覆盖，并提供名为 verify 的一次性验收服务。仓库应包含迁移、README、.gitignore 与 pytest，接口必须返回可定位的字段错误，禁止 TODO、假接口或固定响应。API 接收 RFC 3339 UTC 时间，精确到整秒，带小数秒或非 UTC 偏移一律拒绝；作业区间采用左闭右开，结束必须晚于开始。暂停区间同样左闭右开，先裁剪到作业区间，再将重叠或首尾相接部分合并，区间端点相等不增加时长。可计费秒数为作业秒数减去合并后的暂停秒数，按不足一小时向上取整后乘以非负整数分/小时费率，零秒费用为零。每次成功计算都持久化原始输入、合并区间、可计费秒数、计费小时及总分值，并可按结果标识查询；任何时间倒置、空暂停或负费率都不得写入记录。验收可直接观察重复覆盖的停机只扣除一次、跨界停机仅扣交集，而非法请求返回具体路径且查询不到结算结果。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "5689b5acd0bc", "repo_name": "hazard-label-contrast-preflight", "task_type": "0-1 代码生成", "project_category": "纯前端", "language_framework": "TypeScript, React, Vite, Vitest, Playwright, Docker, Docker Compose", "summary": "化工装置的警示牌送印前，深色文字与底色在屏幕上看似清楚，实际对比度却可能刚好越过可读性边界，操作员需要在浏览器内得到唯一的放行结论。 … 界面逐项显示色块、比值与原因，只要存在不合格项就禁止导出；全部通过时生成包含输入、比值及裁决的 JSON 放行单，使临界文字可明确放行，而不足项稳定标红。"} -->
## 0018 · hazard-label-contrast-preflight

- 创建时间：2026-09-10 11:20:15 +0800
- 项目类别：纯前端
- 任务难度：待评估
- 语言/框架：TypeScript, React, Vite, Vitest, Playwright, Docker, Docker Compose

### User Prompt

<!-- prompt-start -->
化工装置的警示牌送印前，深色文字与底色在屏幕上看似清楚，实际对比度却可能刚好越过可读性边界，操作员需要在浏览器内得到唯一的放行结论。代码从空仓库起步，使用 TypeScript、React 与 Vite 实现纯前端应用，不得增加业务后端或调用外部在线服务；Docker Compose 发布端口须由 WEB_PORT 覆盖，并提供名为 verify 的一次性验收服务，Vitest 与 Playwright 覆盖计算和导入主流程。应用导入 JSON 数组，每项必须包含唯一字符串 id、格式为 #RRGGBB 的不透明前景色和背景色、正数 pt 字号及布尔值 bold；任一项非法时整批拒绝，且不得覆盖上一份有效结果。颜色通道先除以 255，值不大于 0.04045 时除以 12.92，否则计算 ((c+0.055)/1.055)^2.4；相对亮度为 0.2126R+0.7152G+0.0722B，对比度为较亮亮度加 0.05 后除以较暗亮度加 0.05。18pt 以上普通文字或 14pt 以上粗体文字阈值为 3.00，其余为 4.50，比较使用未舍入值，展示采用四舍五入两位；恰好等于阈值算合格。界面逐项显示色块、比值与原因，只要存在不合格项就禁止导出；全部通过时生成包含输入、比值及裁决的 JSON 放行单，使临界文字可明确放行，而不足项稳定标红。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "1a820ff86add", "repo_name": "sample-handoff-ledger", "task_type": "0-1 代码生成", "project_category": "全栈", "language_framework": "Docker, Python 3.12, FastAPI, SQLAlchemy, PostgreSQL, Alembic, React, TypeScript, Vite, Vitest, Playwright", "summary": "样本在存储与处理期间需补录人工测温，值班人员从批次详情选择可流转容器，填写摄氏温度、测量人、测量时间和备注，提交后立即看到判定。 … 批次详情按时间倒序展示温度、判定、测量人与时间，旧批次读取和交接请求保持兼容；pytest 覆盖上下限等值、越界原子写入和非法时间，Vitest 验证展示与输入保留，Playwright 贯通正常测温"} -->
## 0003-5 · sample-handoff-ledger

- 创建时间：2026-09-10 14:51:38 +0800
- 项目类别：全栈
- 任务难度：待评估
- 语言/框架：Docker, Python 3.12, FastAPI, SQLAlchemy, PostgreSQL, Alembic, React, TypeScript, Vite, Vitest, Playwright

### User Prompt

<!-- prompt-start -->
样本在存储与处理期间需补录人工测温，值班人员从批次详情选择可流转容器，填写摄氏温度、测量人、测量时间和备注，提交后立即看到判定。把批次温区扩展为摄氏度上下限，新建温度观测实体保存原始数值与 normal、out_of_range 判定，迁移解析回填现有“2–8°C”数据，无法识别时明确失败。POST /api/containers/{container_id}/temperature-observations 按批次上下限判定边界值，写入观测和唯一时间线事件，越界还把批次置为 review，但不改变位置、离柜计时或交接。已封存容器返回 CONTAINER_ALREADY_REPLACED，测量时间晚于服务端当前时间或早于批次创建时间返回 INVALID_OBSERVED_AT，失败时表单保留输入且事务不留部分结果。批次详情按时间倒序展示温度、判定、测量人与时间，旧批次读取和交接请求保持兼容；pytest 覆盖上下限等值、越界原子写入和非法时间，Vitest 验证展示与输入保留，Playwright 贯通正常测温及越界进入复核且各自产生唯一事件。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "fbd6b586e950", "repo_name": "3000-kiln-firing-review-console", "task_type": "0-1 代码生成", "project_category": "纯前端", "language_framework": "Node.js, React, TypeScript, Vite, Vitest, Docker Compose", "summary": "根据仓库 README 自动整理的导入基线说明：# 窑炉烧成记录检查台 面向陶瓷工作室的离线优先烧成质检工作台。 … 如果端口已被占用，可覆盖宿主端口： ```bash WEB_PORT=18080 docker compose up --build -d curl http://localhost:18080/he"} -->
## 3000 · 3000-kiln-firing-review-console

- 创建时间：2026-09-10 16:12:00 +0800
- 项目类别：纯前端
- 任务难度：待评估
- 语言/框架：Node.js, React, TypeScript, Vite, Vitest, Docker Compose

### User Prompt

<!-- prompt-start -->
根据仓库 README 自动整理的导入基线说明：# 窑炉烧成记录检查台 面向陶瓷工作室的离线优先烧成质检工作台。管理配方和烧成批次，导入温度 CSV，在趋势图上对照目标温度与允许范围，并完成异常归类和复核备注。 ## 功能 - 配方：名称、目标温度、允许温差、计划时长；被批次引用的配方不可删除。 - 批次：名称、窑炉编号、配方、开始时间、备注；支持创建、查看和删除。 - CSV：严格要求 `时间,温度` 表头，校验列数、时间、数值、重复时间点和时间顺序；错误带行号，校验失败不覆盖原记录。 - 检查：SVG 折线图展示实际温度、目标线和允许范围；自动识别温度越界与过长采样间隔。 - 复核：异常可标记为待复核、设备问题、工艺问题、已接受，并保存备注。 - 工作台：首页指标，批次名/窑炉/异常状态筛选，明确空态与操作反馈，窄屏适配。 - 数据：浏览器 `localStorage` 持久化，JSON 全量导入导出、示例数据、一键清空；非法备份不会覆盖当前数据。 ## 本地开发 要求 Node.js 20+。 ```bash npm install npm run dev npm test npm run build ``` CSV 示例： ```csv 时间,温度 2026-09-08 08:30,26 2026-09-08 09:00,120 ``` 时间应为浏览器可解析的日期时间，并按升序排列。 ## Docker ```bash docker compose up --build -d curl http://localhost:8080/health docker compose down ``` 默认打开 <http://localhost:8080>。如果端口已被占用，可覆盖宿主端口： ```bash WEB_PORT=18080 docker compose up --build -d curl http://localhost:18080/health WEB_PORT=18080 docker compose down ``` 镜像采用 Node 构建、Nginx 提供静态站点，容器自带 `/health` 健康检查。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "5ffd4267b16e", "repo_name": "3001-crate-cleaning-trace-platform", "task_type": "0-1 代码生成", "project_category": "全栈", "language_framework": "Node.js, React, TypeScript, Vite, Vitest, Python, FastAPI, SQLAlchemy, pytest, Docker Compose", "summary": "根据仓库 README 自动整理的导入基线说明：# 周转箱清洁追溯平台 面向小型食品工厂的轻量级全栈系统。 … ## 本地开发 后端（Python 3.9+）： ```bash cd backend python3 -m venv .venv source .venv/bin/activate pip inst"} -->
## 3001 · 3001-crate-cleaning-trace-platform

- 创建时间：2026-09-10 16:12:01 +0800
- 项目类别：全栈
- 任务难度：待评估
- 语言/框架：Node.js, React, TypeScript, Vite, Vitest, Python, FastAPI, SQLAlchemy, pytest, Docker Compose

### User Prompt

<!-- prompt-start -->
根据仓库 README 自动整理的导入基线说明：# 周转箱清洁追溯平台 面向小型食品工厂的轻量级全栈系统。维护周转箱台账、登记流转事件，根据当前状态自动识别使用风险，并闭环处理问题。 ## 功能 - 周转箱：新增、编辑 API、停用，维护唯一编号、名称、位置、清洁状态与备注。 - 流转记录：入库、领用、归还、清洗、检查、隔离；事件编号唯一。 - 状态推导：事件登记后更新位置、清洁状态、隔离状态及最近检查时间。 - 风险识别：未清洗再次领用、已隔离仍领用、检查超过 30 天有效期仍使用。 - 问题闭环：待处理、已确认、误报、已关闭，支持处理说明。 - 首页指标及编号、位置、清洁状态、问题状态筛选；完整加载、成功和失败反馈；响应式窄屏布局。 - 首次容器启动自动装入 3 个周转箱及流转/风险示例数据。 ## 一键启动 ```bash docker compose up --build ``` 打开 http://localhost:3001 。API 文档位于 http://localhost:3001/api/docs（通过前端代理）；健康检查为 `/api/health`。SQLite 数据保存在 Docker 命名卷 `crate_data`。 停止服务：`docker compose down`。如需同时清空示例与运行数据：`docker compose down -v`。 ## 本地开发 后端（Python 3.9+）： ```bash cd backend python3 -m venv .venv source .venv/bin/activate pip install -r requirements-dev.txt python -m app.seed uvicorn app.main:app --reload ``` 前端（Node 20+；本地开发时将 `vite.config.ts` 中代理目标改为 `http://localhost:8000`）： ```bash cd frontend npm install npm run dev ``` ## 测试 ```bash cd backend && pytest cd frontend && npm test && npm run build ``` ## API 摘要 - `GET/POST /api/crates`；`PUT /api/crates/{id}`；`POST /api/crates/{id}/deactivate` - `GET/POST /api/events` - `GET /api/issues`；`PATCH /api/issues/{id}` - `GET /api/dashboard`；`GET /api/health` 参数校验失败返回 422，非法箱号返回 404，重复箱号/事件编号与停用箱登记返回 409。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "a2b589354bb2", "repo_name": "3002-plant-specimen-label-preflight", "task_type": "0-1 代码生成", "project_category": "纯前端", "language_framework": "Node.js, React, TypeScript, Vite, Vitest, Docker Compose", "summary": "根据仓库 README 自动整理的导入基线说明：# 植物标本标签预检台 面向小型标本馆与野外团队的纯前端预检工具。 … - 当前数据只存在于当前浏览器环境，建议定期导出 JSON 备份。"} -->
## 3002 · 3002-plant-specimen-label-preflight

- 创建时间：2026-09-10 16:34:18 +0800
- 项目类别：纯前端
- 任务难度：待评估
- 语言/框架：Node.js, React, TypeScript, Vite, Vitest, Docker Compose

### User Prompt

<!-- prompt-start -->
根据仓库 README 自动整理的导入基线说明：# 植物标本标签预检台 面向小型标本馆与野外团队的纯前端预检工具。记录和问题处理状态保存在浏览器 `localStorage`，无需后端。 ## 本地运行 ```bash npm install npm run dev npm test npm run build ``` ## 数据交换 CSV 必须使用以下顺序和名称的 UTF-8 表头： ```text 采集编号,物种名称,采集人,采集日期,地点,纬度,经度,生境备注 ``` 采集编号、采集人、采集日期、地点为必填项。日期采用 `YYYY-MM-DD`；纬度范围为 -90～90，经度范围为 -180～180。导入会一次性校验全部行；任一行失败时不会写入任何数据。JSON 导出包含完整记录和问题处理说明；非法 JSON 导入同样不会改变当前数据。 ## 容器运行 ```bash docker compose up -d --build curl http://localhost:8082/health docker compose down ``` 覆盖宿主端口：`WEB_PORT=9090 docker compose up -d --build`。 ## 说明 - “已修正”和“确认保留”是人工处置状态；编辑记录后问题会实时重新计算。 - 预览中的二维码以可编码文本展示，不依赖扫码库。 - 当前数据只存在于当前浏览器环境，建议定期导出 JSON 备份。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "a99447536991", "repo_name": "3003-theatre-costume-care-tracker", "task_type": "0-1 代码生成", "project_category": "全栈", "language_framework": "Node.js, React, TypeScript, Vite, Vitest, Python, FastAPI, SQLAlchemy, pytest, Docker Compose", "summary": "根据仓库 README 自动整理的导入基线说明：# 剧场服装洗护流转台 面向剧场服装管理人员的轻量全栈工作台。 … 界面适配桌面与 390px 窄屏，所有异步操作都有加载、成功或失败反馈。"} -->
## 3003 · 3003-theatre-costume-care-tracker

- 创建时间：2026-09-10 16:34:19 +0800
- 项目类别：全栈
- 任务难度：待评估
- 语言/框架：Node.js, React, TypeScript, Vite, Vitest, Python, FastAPI, SQLAlchemy, pytest, Docker Compose

### User Prompt

<!-- prompt-start -->
根据仓库 README 自动整理的导入基线说明：# 剧场服装洗护流转台 面向剧场服装管理人员的轻量全栈工作台。支持服装档案、借还/洗护/维修事件、最新状态、异常识别与问题闭环。仓库内置 4 件服装、5 条流转记录和 1 条异常示例数据，首次启动自动写入 SQLite。 ## 一键启动 要求 Docker 与 Docker Compose： ```bash docker compose up --build ``` 打开 <http://localhost:3003>。可用 `WEB_PORT=3100 docker compose up --build` 修改宿主端口。前端通过同源 `/api` 访问后端；SQLite 数据保存在命名卷 `costume_data`。 停止： ```bash docker compose down ``` 如需同时清除运行数据：`docker compose down -v`。 ## 功能与规则 - 服装：新增、编辑、停用；唯一编号、名称、剧目、角色、尺码、位置与备注。 - 流转：登记唯一事件编号、服装、时间、操作人、说明，以及借出、归还、送洗、洗护完成、送修、维修完成六类动作。 - 状态：按每件服装最新一条事件展示在库、借出、洗护中或维修中。本项目按约定不处理复杂乱序重算。 - 问题：借出时识别“未归还再次借出”“待清洗时借出”“维修中借出”，保留触发/相关事件，可处置为待处理、已确认、误报、已关闭并填写说明。 - 总览与检索：关键数量指标，按编号、剧目、角色、状态筛选。 - API 对重复编号返回 409，不存在资源返回 404，停用服装登记事件返回 409，字段缺失/非法返回 422。 ## 本地开发与测试 后端（Python 3.11+）： ```bash python3 -m venv .venv ./.venv/bin/pip install -r backend/requirements-dev.txt ./.venv/bin/pytest ./.venv/bin/uvicorn app.main:app --app-dir backend --reload ``` 根目录 `pytest.ini` 已配置模块路径，测试命令无需手工设置 `PYTHONPATH`。 前端（Node.js 20+）： ```bash cd frontend npm ci npm test npm run build ``` 开发服务器默认需要将 `/api` 指向后端；完整联调建议使用 Compose。 ## API 摘要 - `GET /health` - `GET/POST /api/costumes`，`PUT /api/costumes/{id}`，`PATCH /api/costumes/{id}/deactivate` - `GET/POST /api/events` - `GET /api/stats` - `GET /api/issues`，`PATCH /api/issues/{id}` FastAPI 交互文档可在后端容器网络的 `/docs` 查看；宿主环境通过前端仅代理 `/api`。 ## 技术结构 `backend/` 为 FastAPI、SQLAlchemy 与 SQLite；`frontend/` 为 React、TypeScript、Vite 与 Nginx。界面适配桌面与 390px 窄屏，所有异步操作都有加载、成功或失败反馈。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "ebb46cbfff3a", "repo_name": "hazard-label-contrast-preflight", "task_type": "0-1 代码生成", "project_category": "纯前端", "language_framework": "TypeScript, React, Vite, Vitest, Playwright, Docker, Docker Compose", "summary": "警示牌版面交付印厂前，文字或危险图形若贴近裁切线，成品偏移后可能缺字，操作员要在现有页面独立完成安全边距预检并看到可定位的版面证据。 … 用固定边界样例证明恰好贴合安全线算通过、四个方向的越界量可复算，并由浏览器从粘贴稿件到查看叠加图与问题明细走通主流程，再确认非法稿件不会展示部分几何结论。"} -->
## 0018-3 · hazard-label-contrast-preflight

- 创建时间：2026-09-10 17:42:02 +0800
- 项目类别：纯前端
- 任务难度：待评估
- 语言/框架：TypeScript, React, Vite, Vitest, Playwright, Docker, Docker Compose

### User Prompt

<!-- prompt-start -->
警示牌版面交付印厂前，文字或危险图形若贴近裁切线，成品偏移后可能缺字，操作员要在现有页面独立完成安全边距预检并看到可定位的版面证据。为此建立版面稿对象及其生命周期，输入为毫米单位的画布宽高、出血量、安全边距和带唯一 id、类别、x、y、宽、高的矩形元素，类别只接受文字、危险图形或装饰，解析与几何判定不得复用现有警示牌批次对象。用户在“版面安全区”入口粘贴 JSON 后执行预检，系统以画布内缩安全边距形成安全区，文字和危险图形必须完整包含其中，装饰只校验位于含出血范围的可印区域，并在按输入顺序排列的结果中用 SVG 同比例标出越界边和毫米偏差。字段缺失、非有限数值、非正尺寸、重复 id 或元素超出可印区域时，本次稿件进入输入错误状态并逐项指出路径，已有对比度导入、建议色、撤销和放行单行为保持原样，纯前端构建及 WEB_PORT 覆盖方式不变。用固定边界样例证明恰好贴合安全线算通过、四个方向的越界量可复算，并由浏览器从粘贴稿件到查看叠加图与问题明细走通主流程，再确认非法稿件不会展示部分几何结论。
<!-- prompt-end -->
<!-- task-entry-end -->

