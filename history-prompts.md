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

<!-- task-entry-start {"run_id": "8e4cac5ab71d", "repo_name": "3002-plant-specimen-label-preflight", "task_type": "0-1 代码生成", "project_category": "纯前端", "language_framework": "Node.js, React, TypeScript, Vite, Vitest, Docker Compose", "summary": "为需要一次打印多份馆藏标签的标本员建立“打印批次”闭环，批次保存有序记录编号，并在浏览器本地存储中经历空批次与已编排两个状态。 … 复用现有记录存储、消息样式和容器配置，补充领域单测与组件端到端测试，验收加入顺序分页、重复加入不增量、失效成员清理和八条以上记录跨页打印，现有单条打印、导入及编辑撤销继续通过。"} -->
## 3002-3 · 3002-plant-specimen-label-preflight

- 创建时间：2026-09-10 20:48:07 +0800
- 项目类别：纯前端
- 任务难度：待评估
- 语言/框架：Node.js, React, TypeScript, Vite, Vitest, Docker Compose

### User Prompt

<!-- prompt-start -->
为需要一次打印多份馆藏标签的标本员建立“打印批次”闭环，批次保存有序记录编号，并在浏览器本地存储中经历空批次与已编排两个状态。记录卡可将当前标本加入或移出批次，工具栏入口打开批次预览，按加入顺序将标签确定性排入A4纸每页八格，随后一次调用浏览器打印。领域层负责去重、保持顺序、清理已不存在的记录并生成分页模型，React界面展示批次数量、分页预览和问题记录提示，但问题提示不阻止打印。若导入JSON、载入示例或删除记录导致批次成员失效，打开预览时自动剔除并明确提示，空批次点击预览只反馈“请先选择标本”，且不改变工作集。复用现有记录存储、消息样式和容器配置，补充领域单测与组件端到端测试，验收加入顺序分页、重复加入不增量、失效成员清理和八条以上记录跨页打印，现有单条打印、导入及编辑撤销继续通过。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "0915481f13d9", "repo_name": "3004-archive-box-page-audit", "task_type": "0-1 代码生成", "project_category": "纯前端", "language_framework": "Node.js, React, TypeScript, Vite, Vitest, Docker Compose", "summary": "根据仓库 README 自动整理的导入基线说明：# 纸质档案装盒页码核对台 纯前端、本地优先的档案装盒页码核对工具。 … nginx 提供 SPA 回退和 `/health` 健康检查。"} -->
## 3004 · 3004-archive-box-page-audit

- 创建时间：2026-09-10 23:54:18 +0800
- 项目类别：纯前端
- 任务难度：待评估
- 语言/框架：Node.js, React, TypeScript, Vite, Vitest, Docker Compose

### User Prompt

<!-- prompt-start -->
根据仓库 README 自动整理的导入基线说明：# 纸质档案装盒页码核对台 纯前端、本地优先的档案装盒页码核对工具。支持档案增删改、CSV 原子导入、自动异常识别、问题处置、筛选、每盒区间视图、打印清单，以及 JSON 全量备份恢复。数据只写入当前浏览器 `localStorage`。 ## 本地运行 ```bash npm install npm run dev ``` 测试与构建：`npm test`、`npm run build`。 ## CSV 导入 文件须为 UTF-8 CSV，首行必须严格使用： ```text 档号,标题,年度,保管期限,盒号,起始页,结束页,申报页数,备注 ``` 除备注外均必填；年度与页数字段须为 0–999999 的整数。导入检查现有数据及批内重复档号、起止页合法性。任一行失败会显示行号并取消整批导入，不改变原数据。带逗号或双引号的文本请使用标准 CSV 引号规则。 ## 核对与备份 自动识别重复档号、页码倒置、实际页数与申报页数不符、同盒区间重叠。问题可标记“已修正”或“确认保留”并填写说明；编辑档案后会重新检查并清除其旧处置。JSON 导入先完整校验，非法备份不会覆盖当前数据。 ## Docker ```bash docker compose up --build -d curl http://localhost:8084/health docker compose down ``` 可用 `WEB_PORT=18084` 修改宿主端口。nginx 提供 SPA 回退和 `/health` 健康检查。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "31aca1c58847", "repo_name": "3005-ink-batch-press-release", "task_type": "0-1 代码生成", "project_category": "全栈", "language_framework": "Node.js, React, TypeScript, Vite, Vitest, Python, FastAPI, SQLAlchemy, pytest, Docker Compose", "summary": "根据仓库 README 自动整理的导入基线说明：# 油墨批次上机放行台 面向印刷生产现场的轻量全栈放行工作台。 … 标准 viewport 与断点布局保证桌面及 390px 窄屏无页面级横向溢出。"} -->
## 3005 · 3005-ink-batch-press-release

- 创建时间：2026-09-10 23:54:20 +0800
- 项目类别：全栈
- 任务难度：待评估
- 语言/框架：Node.js, React, TypeScript, Vite, Vitest, Python, FastAPI, SQLAlchemy, pytest, Docker Compose

### User Prompt

<!-- prompt-start -->
根据仓库 README 自动整理的导入基线说明：# 油墨批次上机放行台 面向印刷生产现场的轻量全栈放行工作台。管理油墨批次、上机工单、风险检查和处置闭环；首次启动自动加入 4 个批次、1 张工单及示例问题。 ## Docker 一键启动 ```bash docker compose up --build ``` 浏览器打开 <http://localhost:3005>。可通过 `WEB_PORT=3105 docker compose up --build` 改端口。Compose 项目名固定为 `ink-batch-press-release`，SQLite 数据保存在命名卷中。 停止使用 `docker compose down`；需清除运行数据时使用 `docker compose down -v`。 ## 业务能力 - 新增、编辑、停用批次，记录唯一编号、颜色、供应商、日期、黏度、质检状态与备注。 - 创建唯一工单号的上机记录，关联批次、印刷机、承印材料、计划日期、操作人与说明。 - 工单创建时检查计划日期是否过期，以及批次是否待检、不合格或隔离；不合格与待检分别记录问题类型。 - 问题可更新为待处理、已确认、特批放行、已关闭；特批放行必须填写理由。 - 首页展示批次、合格、30 天内到期、工单、未处理问题指标，支持批次及问题多条件筛选。 - 重复编号返回 409，不存在资源返回 404，停用批次上机返回 409，缺失/非法字段返回 422。 ## 本地测试 后端（Python 3.11+，根配置已提供模块路径，无需设置 `PYTHONPATH`）： ```bash python3 -m venv .venv ./.venv/bin/pip install -r backend/requirements-dev.txt ./.venv/bin/pytest ``` 前端（Node.js 20+）： ```bash cd frontend npm ci npm test npm run build ``` ## API - `GET /health` - `GET/POST /api/batches`，`PUT /api/batches/{id}`，`PATCH /api/batches/{id}/deactivate` - `GET/POST /api/jobs` - `GET /api/issues`，`PATCH /api/issues/{id}` - `GET /api/stats` 技术栈为 FastAPI、SQLAlchemy、SQLite、React、TypeScript、Vite 与 Nginx。标准 viewport 与断点布局保证桌面及 390px 窄屏无页面级横向溢出。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "c7197d31ac5c", "repo_name": "tamper-evident-calibration-ledger", "task_type": "0-1 代码生成", "project_category": "纯后端", "language_framework": "Docker, Python 3.12, FastAPI, SQLAlchemy, PostgreSQL, Alembic, RFC 6962 Merkle Tree, HMAC, pytest", "summary": "为让外部审计系统明确记录已消费到哪次封存，引入“审计接入点”模块，持久保存接入方标识、幂等注册键和最后确认的检查点。 … 通过 Alembic 增加接入点表及唯一约束，在领域服务、模式与路由中贯通契约，端到端测试验证注册重放、顺序确认、多接入点隔离，以及跳级或并发确认只有一次成功且游标无回退。"} -->
## 0004-8 · tamper-evident-calibration-ledger

- 创建时间：2026-09-11 01:48:29 +0800
- 项目类别：纯后端
- 任务难度：待评估
- 语言/框架：Docker, Python 3.12, FastAPI, SQLAlchemy, PostgreSQL, Alembic, RFC 6962 Merkle Tree, HMAC, pytest

### User Prompt

<!-- prompt-start -->
为让外部审计系统明确记录已消费到哪次封存，引入“审计接入点”模块，持久保存接入方标识、幂等注册键和最后确认的检查点。审计员通过 POST /v1/audit-consumers 注册接入点，相同键和参数重放返回原对象，参数不同则返回幂等冲突。处理完一批增量事件后，调用 POST /v1/audit-consumers/{id}/acknowledgements 提交检查点，服务仅接受当前确认点的后继，首次确认只能从首个检查点开始，并在事务中单调推进游标。未知接入点或检查点返回对应未找到错误，跳级、倒退和重复确认返回包含当前值与期望前驱的冲突；数据库故障使用现有错误信封，事件、检查点和审计包行为保持兼容。通过 Alembic 增加接入点表及唯一约束，在领域服务、模式与路由中贯通契约，端到端测试验证注册重放、顺序确认、多接入点隔离，以及跳级或并发确认只有一次成功且游标无回退。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "f6da62a24990", "repo_name": "darkroom-working-solution-mixer", "task_type": "0-1 代码生成", "project_category": "纯前端", "language_framework": "TypeScript, React, Vite, Vitest, Playwright, Docker, Docker Compose", "summary": "暗房临时更换显影罐后，操作员常把“1+4”误当成五倍浓缩液，或在毫升取整后让工作液总量发生偏差。 … 非法字段须就地反馈且不保留旧配液卡；合法结果应同时显示浓缩液、清水、可逐项勾选的量取步骤及适合打印的配液卡，最终可观察到每一步不超容量且所有步骤合计严格等于目标总量。"} -->
## 0025 · darkroom-working-solution-mixer

- 创建时间：2026-09-11 02:57:10 +0800
- 项目类别：纯前端
- 任务难度：待评估
- 语言/框架：TypeScript, React, Vite, Vitest, Playwright, Docker, Docker Compose

### User Prompt

<!-- prompt-start -->
暗房临时更换显影罐后，操作员常把“1+4”误当成五倍浓缩液，或在毫升取整后让工作液总量发生偏差。请从空仓库实现一款纯前端配液台，使用 React、TypeScript 与 Vite，让用户输入稀释式 1+n、目标总量和量筒容量；n 只允许 1 至 99 的整数，总量与容量只允许 100 至 5000 mL 的整数。浓缩液体积按总量÷(n+1)计算，精确值以 0.5 mL 为界四舍五入到整数，清水量必须用目标总量减去取整后的浓缩液，保证两者之和不变。仓库须通过 Docker Compose 启动可访问页面，宿主端口由 WEB_PORT 覆盖，并提供名为 verify 的一次性验收服务运行 Vitest 与 Playwright；README 应在该链路旁解释启动和输入边界，禁止用固定结果代替计算。若单项液体超过量筒容量，界面按“若干满量筒加最后余量”生成分次量取步骤，恰好等于容量时不得多出零余量步骤。非法字段须就地反馈且不保留旧配液卡；合法结果应同时显示浓缩液、清水、可逐项勾选的量取步骤及适合打印的配液卡，最终可观察到每一步不超容量且所有步骤合计严格等于目标总量。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "9c2511d1d4b4", "repo_name": "pharma-gtin-validation-gate", "task_type": "0-1 代码生成", "project_category": "纯后端", "language_framework": "Docker, Python 3.12, FastAPI, Pydantic, pytest, Docker Compose", "summary": "药品收货接口若把扫描到的包装码仅按“十四位数字”放行，录入差错会直接进入后续追溯链路。 … 最终可观察到混合批次中每个包装码都得到唯一、保序且可复算的放行结论。"} -->
## 0027 · pharma-gtin-validation-gate

- 创建时间：2026-09-11 04:16:35 +0800
- 项目类别：纯后端
- 任务难度：待评估
- 语言/框架：Docker, Python 3.12, FastAPI, Pydantic, pytest, Docker Compose

### User Prompt

<!-- prompt-start -->
药品收货接口若把扫描到的包装码仅按“十四位数字”放行，录入差错会直接进入后续追溯链路。请从空仓库实现一个 Python 3.12、FastAPI 纯后端服务，接收含 1 至 100 个 codes 的 JSON 数组；每项必须恰为 14 个 ASCII 数字，空白、连字符、全角数字和其他字符均不转换。GTIN-14 的前 13 位从左到右依次乘 3、1、3、1，校验位固定为 `(10 - 加权和对 10 取模) 对 10 取模`。服务必须保留输入顺序和重复项，为每项返回原值、计算出的校验位以及 valid、format_error 或 checksum_mismatch；格式错误项的计算校验位为 null。数组为空、超过上限、成员非字符串或请求结构错误时整体返回 422 且不返回部分 results，合法结构即使含无效代码也返回 200。使用 Pydantic 固定请求边界和结构化错误，pytest 覆盖公式及接口，Docker Compose 的宿主端口由 API_PORT 覆盖，并提供名为 verify 的一次性验收服务；README 在公式旁给出可复算示例，.gitignore 排除本地产物，代码不得以占位实现代替校验。最终可观察到混合批次中每个包装码都得到唯一、保序且可复算的放行结论。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "14530f197845", "repo_name": "stage-fly-sequence-rehearsal", "task_type": "0-1 代码生成", "project_category": "纯前端", "language_framework": "TypeScript, React, Vite, Vitest, Playwright, Docker, Docker Compose", "summary": "舞台监督在排练前收到一叠吊杆口令卡，顺序稍有颠倒就可能出现未锁定先移动或未归位先解锁，但纸面复核难以展示错误发生时的设备状态。 … 最终监督可看到整套口令闭合回到空载归位，或明确看到唯一首错及当时的吊杆状态。"} -->
## 0028 · stage-fly-sequence-rehearsal

- 创建时间：2026-09-11 04:27:21 +0800
- 项目类别：纯前端
- 任务难度：待评估
- 语言/框架：TypeScript, React, Vite, Vitest, Playwright, Docker, Docker Compose

### User Prompt

<!-- prompt-start -->
舞台监督在排练前收到一叠吊杆口令卡，顺序稍有颠倒就可能出现未锁定先移动或未归位先解锁，但纸面复核难以展示错误发生时的设备状态。请从空仓库实现纯前端预演台，用React、TypeScript与Vite完成动作卡拖放排序、状态推演和首错定位，并以Vitest验证裁决规则、Playwright覆盖重排后复算。初始状态固定为空载且归位；装载仅允许在空载时执行，重量必须为1至500千克的整数；装载后只能锁定，锁定后可移动到舞台位，舞台位只能归位，归位且仍锁定时才可解锁，解锁后才能卸载回到初始状态。仓库须通过Docker Compose运行，宿主端口由WEB_PORT覆盖，并提供名为verify的一次性验收服务；应用不得设置业务后端或访问在线服务。推演遇到第一张非法卡即停止，后续卡不得继续改变状态，界面同时保留此前轨迹、首错卡和具体原因；任何增删或重排都要清除旧结论后重新裁决。README说明卡片含义及启动方式，.gitignore排除依赖与产物，不能以固定响应或未实现按钮代替交互。最终监督可看到整套口令闭合回到空载归位，或明确看到唯一首错及当时的吊杆状态。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "718cbb650296", "repo_name": "3004-archive-box-page-audit", "task_type": "0-1 代码生成", "project_category": "纯前端", "language_framework": "Node.js, React, TypeScript, Vite, Vitest, Docker Compose", "summary": "库房人员需要在不改动档案登记信息的前提下核实实体盒内容，请在每盒页码区间旁加入独立的盒内盘点面板，以一次盘点会话保存所选盒号、创建时间及当时盒内档案的快照。 … 用 Vitest 验证唯一命中和歧义选择落到正确会话项，并以界面测试还原开始盘点、刷新续盘至自动完成，以及无效和重复扫描不推进进度，现有构建与 Docker Compose 健康检查继续通过。"} -->
## 3004-3 · 3004-archive-box-page-audit

- 创建时间：2026-09-11 05:44:22 +0800
- 项目类别：纯前端
- 任务难度：待评估
- 语言/框架：Node.js, React, TypeScript, Vite, Vitest, Docker Compose

### User Prompt

<!-- prompt-start -->
库房人员需要在不改动档案登记信息的前提下核实实体盒内容，请在每盒页码区间旁加入独立的盒内盘点面板，以一次盘点会话保存所选盒号、创建时间及当时盒内档案的快照。用户选择盒号开始后，可连续输入或扫描档号，唯一命中时按会话项标识登记为已找到，全部命中后自动完成，刷新页面仍能查看进度和结果。若同一档号命中多件，面板展示各候选的盘点序号、题名和页码区间，用户明确选中一件才推进进度；取消选择、档号不存在或重复扫描时给出对应提示，快照和计数保持不变。会话项在创建时生成独立标识并保留来源档案标识，匹配服务只更新盘点快照，结果写入新的本地存储键，现有档案、异常处置、连续编页及 JSON 备份内容均不被改写，旧数据可直接加载。用 Vitest 验证唯一命中和歧义选择落到正确会话项，并以界面测试还原开始盘点、刷新续盘至自动完成，以及无效和重复扫描不推进进度，现有构建与 Docker Compose 健康检查继续通过。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "d78a8c3521bf", "repo_name": "darkroom-working-solution-mixer", "task_type": "0-1 代码生成", "project_category": "纯前端", "language_framework": "TypeScript, React, Vite, Vitest, Playwright, Docker, Docker Compose", "summary": "暗房需要在现有配液计算之外建立独立的药液处理容量台账，让操作员按实际冲洗量掌握一批药液还能处理多少胶片，避免凭记忆继续使用已经耗尽的药液。 … 原配液表单、分罐步骤、打印卡和无障碍反馈保持原有行为，Docker Compose 的 web 与 verify 链路继续可用，WEB_PORT 仍可覆盖宿主端口。"} -->
## 0025-3 · darkroom-working-solution-mixer

- 创建时间：2026-09-11 05:44:54 +0800
- 项目类别：纯前端
- 任务难度：待评估
- 语言/框架：TypeScript, React, Vite, Vitest, Playwright, Docker, Docker Compose

### User Prompt

<!-- prompt-start -->
暗房需要在现有配液计算之外建立独立的药液处理容量台账，让操作员按实际冲洗量掌握一批药液还能处理多少胶片，避免凭记忆继续使用已经耗尽的药液。操作员从顶部“容量台账”入口创建带名称和额定容量的药液批次，再选中批次登记本次处理的等效胶片数量与备注，页面按时间展示使用记录、累计用量、剩余容量和使用中或已耗尽状态。领域服务以创建批次和登记用量两个命令作为契约，每条记录写入前重新计算剩余量，Vitest 应证明连续登记不会产生负数且恰好用完时状态确定转为已耗尽。批次与不可修改的使用记录保存在 localStorage，刷新后仍能还原同一台账，空名称、非正整数或超过剩余容量时就地说明原因且不写入记录，Playwright 从新建批次走到分次用完并验证刷新恢复。原配液表单、分罐步骤、打印卡和无障碍反馈保持原有行为，Docker Compose 的 web 与 verify 链路继续可用，WEB_PORT 仍可覆盖宿主端口。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "31168478d2a3", "repo_name": "stage-fly-sequence-rehearsal", "task_type": "0-1 代码生成", "project_category": "纯前端", "language_framework": "TypeScript, React, Vite, Vitest, Playwright, Docker, Docker Compose", "summary": "舞台监督需要把纸面预演转成逐张报令的走台会话，以便操作者只看到当前应执行的口令、执行后的吊杆状态和剩余张数，而不是一次读完整条轨迹。 … Vitest验证合法推进、首错停步和末张幂等，Playwright证明标准闭环逐张完成、非法序列在对应卡受阻且后续状态不变，并确认走台期间编辑入口不可用、结束后重新可用。"} -->
## 0028-3 · stage-fly-sequence-rehearsal

- 创建时间：2026-09-11 07:30:00 +0800
- 项目类别：纯前端
- 任务难度：待评估
- 语言/框架：TypeScript, React, Vite, Vitest, Playwright, Docker, Docker Compose

### User Prompt

<!-- prompt-start -->
舞台监督需要把纸面预演转成逐张报令的走台会话，以便操作者只看到当前应执行的口令、执行后的吊杆状态和剩余张数，而不是一次读完整条轨迹。监督整理任意非空序列后点击“开始走台”，系统复制当时的卡序与重量作为会话快照，随后每次点击“执行下一张”都通过现有单卡裁决推进游标，合法闭合时显示走台完成，遇到非法卡则停在执行前状态并给出卡号与原因。会话领域契约应以纯函数管理待命、进行中、完成、受阻这一组状态及快照、游标和当前吊杆状态，App负责接线，独立走台面板呈现当前卡与进度，进行中锁定牌库、排序、重量、删除和草稿操作，结束或受阻后恢复编辑。空序列开始时留在待命并显示可理解的反馈，重复点击不会越过末张或受阻卡，刷新仍按现有空序列启动，草稿格式、实时裁决、Docker Compose与WEB_PORT覆盖保持兼容。Vitest验证合法推进、首错停步和末张幂等，Playwright证明标准闭环逐张完成、非法序列在对应卡受阻且后续状态不变，并确认走台期间编辑入口不可用、结束后重新可用。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "7c172a56bc82", "repo_name": "pharma-gtin-validation-gate", "task_type": "0-1 代码生成", "project_category": "纯后端", "language_framework": "Docker, Python 3.12, FastAPI, Pydantic, pytest, Docker Compose", "summary": "药品完成收货后，质量人员为该收货单登记冷链记录，提交唯一评估号、允许温区及按时间递增的采样点，取得可复查的运输温控结论。 … pytest 与 verify 通过真实 HTTP 验证全程合规、多个越界区段的积分和读取一致性、重复评估号冲突，以及非法时间序列不产生残记录。"} -->
## 0027-3 · pharma-gtin-validation-gate

- 创建时间：2026-09-11 07:52:38 +0800
- 项目类别：纯后端
- 任务难度：待评估
- 语言/框架：Docker, Python 3.12, FastAPI, Pydantic, pytest, Docker Compose

### User Prompt

<!-- prompt-start -->
药品完成收货后，质量人员为该收货单登记冷链记录，提交唯一评估号、允许温区及按时间递增的采样点，取得可复查的运输温控结论。实现独立的冷链评估领域模块，将连续越界采样归并为异常区段，按相邻点做梯形积分，计算持续分钟数和偏离温区的度分钟，并保存原始采样与摘要。POST /cold-chain-assessments 创建评估，GET /cold-chain-assessments/{assessment_id} 返回同一份确定性结果，计算值按分钟保留两位小数。评估号重复返回409，收货单不存在返回404，温区无效、采样点不足、时间未严格递增或跨度超过七天返回422，失败请求不留记录。SQLite 启动迁移加入评估与采样表并关联现有收货单，FastAPI 模型及错误信封保持项目风格，既有接口不改变，Compose 不增加常驻服务且 API_PORT 仍可覆盖宿主端口。pytest 与 verify 通过真实 HTTP 验证全程合规、多个越界区段的积分和读取一致性、重复评估号冲突，以及非法时间序列不产生残记录。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "839ce73ab2ed", "repo_name": "3005-ink-batch-press-release", "task_type": "0-1 代码生成", "project_category": "全栈", "language_framework": "Node.js, React, TypeScript, Vite, Vitest, Python, FastAPI, SQLAlchemy, pytest, Docker Compose", "summary": "将批次建档时的一次黏度值扩展为独立的现场黏度巡检模块，操作员从批次列表展开巡检面板，按实际测量顺序登记测量时间、黏度、人员和备注，并查看按时间排列的历史与趋势。 … 前端测试走通登记两次异常读数并刷新趋势和问题，后端测试证明正常读数不告警、逆序时间返回冲突且不落库，并用并发请求确认同批次只生成一条未关闭问题。"} -->
## 3005-6 · 3005-ink-batch-press-release

- 创建时间：2026-09-11 12:48:17 +0800
- 项目类别：全栈
- 任务难度：待评估
- 语言/框架：Node.js, React, TypeScript, Vite, Vitest, Python, FastAPI, SQLAlchemy, pytest, Docker Compose

### User Prompt

<!-- prompt-start -->
将批次建档时的一次黏度值扩展为独立的现场黏度巡检模块，操作员从批次列表展开巡检面板，按实际测量顺序登记测量时间、黏度、人员和备注，并查看按时间排列的历史与趋势。后端增加巡检记录实体及批次关联，登记接口以数据库写事务拒绝早于该批次最新测量时间的补录，并按测量时间和记录编号稳定排序，使并发登记不会漏判或重复判定。每次成功登记后，以批次建档黏度为基准检查最新连续两条记录，若均向同一方向偏离超过百分之十，则原子创建该批次至多一条未关闭的黏度漂移问题，刷新后在趋势和问题处置中都能看到结果。为让巡检问题不依赖工单，问题表的工单关联改为可空，响应增加问题来源并允许工单编号为空，巡检问题显示批次巡检标识，现有工单风险问题仍展示原工单编号并保持筛选和处置行为，旧库启动时完成兼容迁移。前端测试走通登记两次异常读数并刷新趋势和问题，后端测试证明正常读数不告警、逆序时间返回冲突且不落库，并用并发请求确认同批次只生成一条未关闭问题。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "d0b22ab8bcfd", "repo_name": "accessible-egress-grid-verifier", "task_type": "0-1 代码生成", "project_category": "全栈", "language_framework": "Docker, Python 3.12, FastAPI, Pydantic, TypeScript, React, Vite, pytest, Vitest, Playwright", "summary": "改造中的社区礼堂只有一张方格化平面草图，轮椅疏散路线若靠肉眼挑选，常会遗漏被临时隔断截断的通道。 … 最终核验员能看到唯一最短疏散轨迹，或看到不可能误解为可通行的失败现象。"} -->
## 0029 · accessible-egress-grid-verifier

- 创建时间：2026-09-11 12:44:59 +0800
- 项目类别：全栈
- 任务难度：待评估
- 语言/框架：Docker, Python 3.12, FastAPI, Pydantic, TypeScript, React, Vite, pytest, Vitest, Playwright

### User Prompt

<!-- prompt-start -->
改造中的社区礼堂只有一张方格化平面草图，轮椅疏散路线若靠肉眼挑选，常会遗漏被临时隔断截断的通道。请从空仓库实现一个全栈核验器：核验员在 React 网格编辑器中创建 2 至 40 行、2 至 40 列的平面，设置恰好一个起点、一个出口及若干阻挡格，前端把结构化数据提交给 FastAPI，API 自行实现四方向最短路径搜索并返回有序坐标和步数。每格代表 0.5 米，起点计入路线但不计步；只能上下左右进入非阻挡格。存在多条等长路线时，扩展相邻格必须固定按上、右、下、左，因而结果唯一。仓库中前置配置 TypeScript、Pydantic、pytest、Vitest 与 Playwright，并提供名为 verify 的一次性验收服务；Docker Compose 启动 web 与 api，WEB_PORT、API_PORT 可覆盖宿主端口。README 应说明请求契约和运行方式，.gitignore 排除构建产物，前后端均须给出可操作的字段级错误反馈，禁止用固定响应或占位实现代替联调。行列不符、坐标越界、起终点重合或被阻挡时整次请求失败且不返回路线；出口不可达时明确显示“不可达”、已探索格数为零以外的真实值，但路线画布不得残留上一次成功结果。最终核验员能看到唯一最短疏散轨迹，或看到不可能误解为可通行的失败现象。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "bfe66a8001aa", "repo_name": "concrete-compression-release-gate", "task_type": "0-1 代码生成", "project_category": "纯后端", "language_framework": "Docker, Python 3.12, FastAPI, Pydantic, Decimal, pytest, Docker Compose", "summary": "施工现场送来的三块混凝土试件可能平均强度达标，却被异常低值掩盖，实验室需要只接收整组数据并立即给出唯一结论的纯后端接口。 … README 写明接口示例、单位和计算规则，.gitignore 排除本地产物，禁止固定响应或占"} -->
## 0030 · concrete-compression-release-gate

- 创建时间：2026-09-11 13:43:35 +0800
- 项目类别：纯后端
- 任务难度：待评估
- 语言/框架：Docker, Python 3.12, FastAPI, Pydantic, Decimal, pytest, Docker Compose

### User Prompt

<!-- prompt-start -->
施工现场送来的三块混凝土试件可能平均强度达标，却被异常低值掩盖，实验室需要只接收整组数据并立即给出唯一结论的纯后端接口。代码从空仓库起步，使用 Python 3.12、FastAPI、Pydantic 与 Decimal，实现请求契约、强度计算和批次放行裁决。每次 JSON 请求必须包含设计强度及恰好三个试件，每个试件提供受压面积 mm² 和破坏载荷 kN，所有数值均须大于零。单块强度按“载荷×1000÷面积”计算为 MPa，先以 ROUND_HALF_UP 保留 0.1 MPa，再用三个舍入后数值计算算术平均值并同法保留 0.1 MPa。仅当平均值不低于设计强度且最低单值不低于设计强度的 85.0% 时通过，等于阈值计入通过。合法响应返回三项强度、平均强度、通过布尔值和 reasons 数组；未通过时数组须包含全部未满足条件，并固定按 MEAN_BELOW_DESIGN、MIN_BELOW_85_PERCENT 排序，同时不满足时返回两项，通过时为空。字段缺失、试件数量错误或非正数值统一返回 422，且不得返回任何部分强度。Docker Compose 发布 API，宿主端口可由 API_PORT 覆盖，并提供 verify 一次性服务，以 pytest 通过真实 HTTP 验证链路。README 写明接口示例、单位和计算规则，.gitignore 排除本地产物，禁止固定响应或占
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "ab6cfe0328a1", "repo_name": "organ-roll-hole-verifier", "task_type": "0-1 代码生成", "project_category": "纯前端", "language_framework": "TypeScript, React, Vite, Vitest, Playwright, Docker, Docker Compose", "summary": "手摇风琴纸带的孔位偏差会造成阀门回位不及或同时耗气过多，制带员需要在冲孔前核验离散网格。 … 使用 Docker Compose 启动 web，宿主端口可由 WEB_PORT 覆盖，并提供一次性 verify 验收服务；README 给出网格坐标示例，.gitignore 排除构建产物，禁止固"} -->
## 0032 · organ-roll-hole-verifier

- 创建时间：2026-09-11 13:58:52 +0800
- 项目类别：纯前端
- 任务难度：待评估
- 语言/框架：TypeScript, React, Vite, Vitest, Playwright, Docker, Docker Compose

### User Prompt

<!-- prompt-start -->
手摇风琴纸带的孔位偏差会造成阀门回位不及或同时耗气过多，制带员需要在冲孔前核验离散网格。请从空仓库起步，实现 TypeScript、React、Vite 纯前端应用，不调用在线服务。编辑区固定 24 条音轨，长度可选 32、48 或 64 个节拍列，支持鼠标点击和键盘切换孔位。裁决规则唯一：第 1、2 列及最后 2 列禁孔；同一音轨任意两孔列号差至少为 2；每列最多 4 个孔；至少有 1 个孔才可制作。一次裁决列出全部违规格，面板按禁孔、复孔过近、列超载聚合展示，修正后立即重算；合法时明确显示可制作与总孔数，空白时显示尚未录入。比例化打印预览须保留 24 条音轨、列号及违规标记。Vitest 覆盖四类结论和边界列，Playwright 覆盖键鼠编辑、违规修正闭环及打印预览一致性。使用 Docker Compose 启动 web，宿主端口可由 WEB_PORT 覆盖，并提供一次性 verify 验收服务；README 给出网格坐标示例，.gitignore 排除构建产物，禁止固定响应或未实现按钮。
<!-- prompt-end -->
<!-- task-entry-end -->

<!-- task-entry-start {"run_id": "1a096ddbc76e", "repo_name": "redaction-rule-lab", "task_type": "0-1 代码生成", "project_category": "纯前端", "language_framework": "Docker, TypeScript, Vue 3, Vite, Vitest, Playwright", "summary": "法务调整规则后，需要在真实合同外发前确认一组典型片段的脱敏结果没有回退，请加入本地“回归样例集”闭环，样例仅驻留浏览器内存且不参与正式导出。 … Vitest 验证样例解析、顺序执行、首差异定位及规则变化重跑，Playwright 从载入含一项失败的样例集、定位差异、修正规则触发全量通过，到继续完成原有脱敏确认和下载，证明该模块可独立验收。"} -->
## 0008-3 · redaction-rule-lab

- 创建时间：2026-09-11 20:54:47 +0800
- 项目类别：纯前端
- 任务难度：待评估
- 语言/框架：Docker, TypeScript, Vue 3, Vite, Vitest, Playwright

### User Prompt

<!-- prompt-start -->
法务调整规则后，需要在真实合同外发前确认一组典型片段的脱敏结果没有回退，请加入本地“回归样例集”闭环，样例仅驻留浏览器内存且不参与正式导出。用户选择 JSON 样例文件后自动运行，每项包含编号、原文、期望脱敏文本及可选的期望命中规则编号序列，解析器校验唯一编号和字段类型，执行器复用当前有效规则与完整管线并按文件顺序产出结果。store 维护当前样例集、逐项结果和规则变化后的重跑状态，独立面板汇总通过数，点击失败项可查看首个文本差异位置、实际与期望片段以及规则序列差异。文件语法或字段错误应定位到样例编号或数组下标并保留上一份有效报告，单项管线失败显示原有错误位置且不覆盖其他项，回归检查不改变规则启停、人工确认、例外审阅和下载闸门，旧规则与现有操作无需迁移。Vitest 验证样例解析、顺序执行、首差异定位及规则变化重跑，Playwright 从载入含一项失败的样例集、定位差异、修正规则触发全量通过，到继续完成原有脱敏确认和下载，证明该模块可独立验收。
<!-- prompt-end -->
<!-- task-entry-end -->

