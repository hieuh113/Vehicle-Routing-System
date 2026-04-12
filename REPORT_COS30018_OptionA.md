# COS30018 – Intelligent Systems  
## Project: Delivery Vehicle Routing System (Option A)

> **Bản báo cáo trình bày hoàn chỉnh đúng cấu trúc đề COS30018 (Cover, TOC, Introduction, Architecture, Protocols, Optimization, Scenarios, Analysis, Conclusion, References):**  
> **`REPORT_BAO_CAO_COS30018_HOAN_CHINH.md`**
>
> File này giữ bản chi tiết theo outline số (1–11) + checklist; dùng làm nháp hoặc tham chiếu kỹ thuật.

---

# 1. Cover Page *(bắt buộc — điền tay hoặc merge template Word)*

| Mục | Nội dung |
|-----|----------|
| **Tên môn** | COS30018 – Intelligent Systems |
| **Tên đề tài** | *Delivery Vehicle Routing System* |
| **Nhóm** | Member 1 + Student ID; Member 2 + Student ID; *(thêm Member 3–4 nếu có)* |
| **Tutor** | *(tên tutor)* |
| **Ngày nộp** | *(ngày)* |

---

# 2. Table of Contents (TOC)

- Dùng **References → Table of Contents** trong Word để TOC và **số trang** cập nhật tự động.
- Cấu trúc mục khớp các phần **3 → 11** dưới đây.

---

# 3. Introduction *(khuyến nghị 0.5 – 1 trang)*

## 3.1 Background

**Vehicle Routing Problem (VRP)** là lớp bài toán tối ưu tổ hợp: cần phân bổ nhiều điểm dừng cho một hoặc nhiều xe sao cho một hoặc nhiều mục tiêu (chi phí, quãng đường, thời gian…) đạt giá trị tốt. Trong thực tế, VRP và biến thể của nó xuất hiện rộng rãi trong **logistics**, **giao hàng nội đô** (Amazon, Shopee, Grab, v.v.), nơi cần cân bằng số đơn phục vụ, quãng đường, và ràng buộc xe.

Đề tài Option A của COS30018 yêu cầu một hệ **đa agent** với **Master Routing Agent (MRA)** và nhiều **Delivery Agent (DA)**, giao tiếp theo giao thức rõ ràng; MRA dùng **một kỹ thuật tối ưu do nhóm tự triển khai** (không lấy OR-Tools/OptaPlanner làm solver chính); có **GUI** và **file cấu hình / dữ liệu**; khoảng cách giữa hai điểm theo **đường thẳng (Euclidean)** trong mặt phẳng tọa độ.

## 3.2 Problem Statement

**Bài toán cụ thể trong code:**

- Có **nhiều xe** (mỗi xe ứng với một DA trong mô hình JADE, hoặc một `Vehicle` trong JSON gửi API).
- Có **nhiều điểm giao** (parcel / delivery item), mỗi điểm có tọa độ `(x, y)` và một **ID** số nguyên (Java) hoặc chuỗi dạng `item-k` (frontend, backend parse số từ chuỗi).
- **Kho (warehouse):** điểm xuất phát và kết thúc của mỗi route. Trong mã:
  - Luồng **JADE + `RoutingRequest.withDefaults`**: dùng `Warehouse.defaultWarehouse()` tức **`(0.0, 0.0)`** (`Warehouse.java`).
  - Luồng **HTTP `POST /solve`**: tọa độ kho lấy từ JSON (`BackendApiServer.java` + giao diện Setup, mặc định thường là `(50, 50)` trong UI mẫu).

**Mục tiêu tối ưu (đúng spec + đúng implementation):**

1. **Ưu tiên tối đa số kiện / đơn giao được** (`deliveredCount`).
2. **Kế đến, tối thiểu tổng quãng đường** tất cả xe (`totalDistance`).

Trong `GASolver.java`, thứ tự ưu tiên này được cố định bằng comparator `SOLUTION_COMPARATOR` (so sánh trước theo `deliveredCount`, sau theo `totalDistance`) và bằng hàm fitness dạng  
`fitness = deliveredCount * BIG_CONSTANT - totalDistance` với `BIG_CONSTANT = 1_000_000.0`.

Khi **tổng capacity** của các xe **nhỏ hơn** số kiện (hoặc khi **maxDistance** quá chặt), một phần kiện rơi vào danh sách **`undeliveredItemIds`** — hệ thống vẫn cho lời giải hợp lệ, không giả định “luôn giao hết”.

## 3.3 Objectives

Theo đề bài và phạm vi đã code:

1. **Multi-agent (JADE):** `MasterRoutingAgent` thu thập `VehicleInfo` từ các `DeliveryAgent`, đọc danh sách kiện từ file, gọi `RoutingService` → `GASolver`, rồi gửi route từng xe qua ACL (`agents/MasterRoutingAgent.java`, `agents/DeliveryAgent.java`, `Main.java`).
2. **Tối ưu route:** **Genetic Algorithm** tự cài trong `optimizer/GASolver.java`, được gọi thống nhất qua `service/RoutingService.java`.
3. **GUI:** ứng dụng React (`frontend/Vehicle-Routing-System-main/`) — trang Setup (tham số, sinh dữ liệu, load file), trang Visualization (gọi backend, bản đồ, thống kê, panel mô phỏng tin nhắn agent).
4. **API tách GUI:** `BackendApiServer.java` (HTTP server built-in JDK) nhận JSON, chạy cùng solver, trả JSON cho frontend.

## 3.4 Scope

**Trong phạm vi đã triển khai:**

- Một **kho chung** cho mọi route (warehouse).
- **Khoảng cách:** Euclidean giữa các cặp tọa độ; route của một xe = kho → các kiện theo thứ tự gán trong decode → kho (`DistanceCalculator`, `GASolver.calculateRouteDistance`).

**Không có trong code hiện tại:**

- Giao thông / thời gian di chuyển thực tế trên bản đồ đường bộ.
- **VRPTW** (time windows) — Extension Option 1.
- **Đấu thầu DA–MRA** — Extension Option 2.

---

# 4. System Architecture *(khuyến nghị 1 – 1.5 trang)*

## 4.1 Overall Architecture

Hệ thống có **hai cách chạy** cùng chung **lõi tối ưu Java**, cần mô tả rõ trong báo cáo để tránh hiểu nhầm “chỉ có GUI” hoặc “chỉ có JADE”.

### A. Pipeline đa agent JADE (demo console + JADE GUI)

```
User / Developer
    → chạy Main.java (JADE container + RemoteAgentManagement GUI)
    → MasterRoutingAgent (mra) + DeliveryAgent(s) (da1, da2, …)
    → (sau khi đủ DA đăng ký) RoutingService → GASolver
    → ACLMessage: route-assignment tới từng DA
    → DA gửi route-ack về MRA
```

- `Main.java` tạo agent `mra` với tham số: số xe kỳ vọng, đường dẫn file kiện (mặc định `data/items.txt` nếu không truyền `args[0]`).
- MRA **không** nhận danh sách kiện qua message từ DA; kiện **đọc từ file** qua `DeliveryItemParser.parse(itemsFilePath)`.

### B. Pipeline GUI + REST (minh họa cấu hình và visualization)

```
User → React Setup / Visualization
    → POST http://localhost:8080/solve  (JSON body)
    → BackendApiServer → parse JSON → RoutingRequest
    → RoutingService → GASolver
    → JSON response (routes, undeliveredItems, bestFitness, bestGeneration)
    → Map + stats; panel “Agent Communication” dựng lại chuỗi tin nhắn tương đương giao thức JADE
```

**Giải thích vai trò (mapping với outline “User → GUI → MRA → DAs”):**

- **GUI:** nhập kho, kiện, xe, tham số GA; tùy chọn sinh ngẫu nhiên / kịch bản có sẵn / load `.json` hoặc file text dòng `id,x,y` (`SetupPage.tsx`).
- **MRA (khái niệm):** trong JADE là agent `MasterRoutingAgent`; trong luồng web, **vai trò “tập hợp ràng buộc + chạy solver”** do backend Java đảm nhiệm, còn UI hiển thị luồng “MRA ↔ DA” ở mức **mô phỏng** sau khi có kết quả (`VisualizationPage.tsx`: `buildCapacityRegistrationMessages`, `buildRouteAssignmentMessages`, `buildAckMessages`).
- **DA:** trong JADE là `DeliveryAgent`; trong GUI là các `vehicles[].id` được gửi lên API và hiển thị trên map.

### Sơ đồ khối (copy sang Word / draw.io)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Presentation layer                        │
│  React: SetupPage, VisualizationPage, MapVisualization,        │
│  AgentCommunication, SolutionStats (frontend/.../src/app/...)    │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP POST /solve (JSON)
┌────────────────────────────▼────────────────────────────────────┐
│  BackendApiServer.java (port 8080) — optional cho GUI              │
└────────────────────────────┬────────────────────────────────────┘
                             │ RoutingService.solve(RoutingRequest)
┌────────────────────────────▼────────────────────────────────────┐
│  GASolver.java  +  DistanceCalculator  +  model.*                  │
└────────────────────────────▲────────────────────────────────────┘
                             │ same RoutingService
┌────────────────────────────┴────────────────────────────────────┐
│  JADE: MasterRoutingAgent → RoutingService (sau register-capacity)│
│        DeliveryAgent × N                                          │
└───────────────────────────────────────────────────────────────────┘
```

## 4.2 Components

### 4.2.1 Master Routing Agent (MRA) — `MasterRoutingAgent.java`

**Nhận:**

- Tin **`register-capacity`** từ từng DA (nội dung parse thành `VehicleInfo`: `vehicleId`, `capacity`, `maxDistance`).
- Danh sách kiện: **từ file** (`itemsFilePath`, mặc định `data/items.txt`), không phải từ ACL trong code hiện tại.

**Xử lý:**

- Khi `vehicles.size() == expectedVehicles` và chưa gửi route (`routesSent`), gọi `RoutingService.solve(RoutingRequest.withDefaults(items, vehicleList))` → GA.

**Output:**

- Với mỗi `RouteAssignment`: gửi ACL **`route-assignment`**, nội dung chuỗi ghép `vehicleId`, `items`, `distance`.

### 4.2.2 Delivery Agents (DAs) — `DeliveryAgent.java`

**Gửi:** một lần (OneShotBehaviour) message **`register-capacity`** tới MRA (`AID` local name từ tham số, mặc định `"mra"`).

**Nhận:** message **`route-assignment`** (template lọc `INFORM` + conversationId).

**Phản hồi:** gửi **`route-ack`** (`CONFIRM`) về MRA với `vehicleId` và `status=RECEIVED`.

Tham số khởi tạo agent (capacity, maxDistance, tên MRA) truyền qua **Object[]** trong `Main.java`.

### 4.2.3 GUI — `frontend/Vehicle-Routing-System-main/`

**Input:**

- Tọa độ **warehouse** (x, y trong [0, 100] trên form).
- **Delivery items:** sinh ngẫu nhiên theo `numItems`, hoặc clustered / limited scenarios, hoặc **Load Config / Items** — `.json` (warehouse + deliveryItems + vehicles) hoặc text **`id,x,y`** mỗi dòng (`SetupPage.tsx`: `parseTextItems`).
- **Vehicles:** thêm/xóa, chỉnh `capacity`, `maxDistance`, màu hiển thị.
- **Tham số GA:** `populationSize`, `generations`, `mutationRate`, `eliteSize` (đưa vào body JSON khi Optimize). Các tham số như `tournamentSize`, `crossoverRate` **có thể không gửi** — backend dùng giá trị mặc định từ `GAConfig.defaultConfig()` (`BackendApiServer.java` dùng `getIntOrDefault` / `getDoubleOrDefault`).

**Output:**

- Gọi backend, nhận `solution.routes` (mỗi route: `vehicleId`, `stops`, `totalDistance`, `itemsDelivered`), `undeliveredItems`, tổng (`VisualizationPage.tsx`).
- **MapVisualization** vẽ tuyến; **SolutionStats** hiển thị số liệu; **AgentCommunication** liệt kê message kiểu `REGISTER_CAPACITY` / `ROUTE_ASSIGNMENT` / `ROUTE_ACK`.

### 4.2.4 Data Model *(khớp package `model/`)*

| Thực thể | Lớp / type | Trường chính (theo code) |
|----------|------------|---------------------------|
| Kiện giao | `DeliveryItem` | `id` (int), `x`, `y` |
| Xe / DA | `VehicleInfo` | `vehicleId` (String), `capacity` (int), `maxDistance` (double) |
| Kho | `Warehouse` | `x`, `y`; static `defaultWarehouse()` → `(0,0)` |
| Phân công | `RouteAssignment` | `vehicleId`, `itemIds` (List&lt;Integer&gt;), `totalDistance` |
| Yêu cầu tối ưu | `RoutingRequest` | `warehouse`, `items`, `vehicles`, `GAConfig` |
| Kết quả | `RoutingResponse` / `GASolverResult` | `assignments`, `undeliveredItemIds`, `deliveredCount`, `totalDistance`, `bestFitness`, `bestGeneration` |
| GA | `GAConfig` | `populationSize`, `generations`, `tournamentSize`, `eliteSize`, `crossoverRate`, `mutationRate` |

**Parser file kiện (JADE / `BackendDemoRunner`):** `DeliveryItemParser` — mỗi dòng không rỗng: `id,x,y` phân tách dấu phẩy (`data/items.txt`).

---

# 5. Interaction Protocol *(rất quan trọng — ~1 trang)*

## 5.1 Protocol Description (đúng thứ tự code)

1. **DA → MRA:** sau khi agent khởi động, DA gửi **`INFORM`**, `conversationId = "register-capacity"`**, nội dung ASCII dạng `key=value` cách nhau bởi `;`  
   Ví dụ: `vehicleId=da1;capacity=3;maxDistance=100.0` (`DeliveryAgent.java`).

2. **MRA:** `CyclicBehaviour` nhận message; nếu đúng `conversationId` và performative, parse bằng `parseVehicleInfo`, lưu vào `Map<String, VehicleInfo> vehicles`.

3. **MRA (khi đủ số xe):** `runSolverAndSendAssignments()` — gọi solver, sau đó với mỗi `RouteAssignment` gửi **`INFORM`**, `conversationId = "route-assignment"`**, nội dung:  
   `vehicleId=...;items=...;distance=...` (danh sách ID kiện từ `assignment.getItemIds()`, khoảng cách `getTotalDistance()`).

4. **DA → MRA:** khi nhận route, DA gửi **`CONFIRM`**, `conversationId = "route-ack"`**, nội dung `vehicleId=...;status=RECEIVED`**.

5. **MRA:** log ACK (không gửi thêm reply trong code hiện tại).

**Lưu ý:** `expectedVehicles` lấy từ tham số khởi tạo MRA (`Main.java` truyền `"2"` mặc định). Nếu số DA thực tế không khớp, MRA sẽ không kích hoạt solver theo điều kiện `vehicles.size() == expectedVehicles`.

## 5.2 Sequence Diagram *(bắt buộc — export sang hình trong Word)*

Mapping tên thao tác (outline) ↔ code:

| Outline (ví dụ) | Thực tế trong project |
|-----------------|------------------------|
| `sendCapacity()` | ACL `INFORM` + `register-capacity` (`DeliveryAgent`) |
| `computeRoutes()` | `RoutingService.solve` → `GASolver.solve` (`MasterRoutingAgent.runSolverAndSendAssignments`) |
| `sendRoute()` | ACL `INFORM` + `route-assignment` |

**Mermaid (dán vào [mermaid.live](https://mermaid.live) để xuất PNG):**

```mermaid
sequenceDiagram
    participant DA1 as DeliveryAgent da1
    participant DA2 as DeliveryAgent da2
    participant MRA as MasterRoutingAgent mra

    DA1->>MRA: INFORM [register-capacity]<br/>vehicleId=da1;capacity=...;maxDistance=...
    DA2->>MRA: INFORM [register-capacity]<br/>vehicleId=da2;capacity=...;maxDistance=...

    Note over MRA: vehicles.size() == expectedVehicles<br/>runSolverAndSendAssignments()

    MRA->>MRA: RoutingService.solve → GASolver.solve

    MRA->>DA1: INFORM [route-assignment]<br/>vehicleId;items;distance
    MRA->>DA2: INFORM [route-assignment]<br/>vehicleId;items;distance

    DA1->>MRA: CONFIRM [route-ack]<br/>vehicleId=da1;status=RECEIVED
    DA2->>MRA: CONFIRM [route-ack]<br/>vehicleId=da2;status=RECEIVED
```

## 5.3 Communication Language

| Luồng | Định dạng | Ghi chú |
|--------|-----------|---------|
| JADE MRA ↔ DA | **ACLMessage** + **chuỗi `key=value;...`** | `conversationId` phân biệt giai đoạn |
| GUI ↔ Backend | **JSON** (HTTP POST) | `BackendApiServer` parse bằng `ScriptEngine` (`Java.asJSONCompatible(...)`) rồi map sang `RoutingRequest` |
| File kiện (MRA / demo) | **Text** `id,x,y` / dòng | `DeliveryItemParser` |

---

# 6. Optimization Technique *(khuyến nghị 2 – 3 trang)*

## 6.1 Problem Formulation

**Input:**

- Tập kiện `items = {1..n}` (thứ tự trong `List<DeliveryItem>`), mỗi phần tử có `(x, y)` và `id`.
- Tập xe `vehicles = {v1..vk}` (`VehicleInfo`), mỗi xe có `capacity` (số kiện tối đa) và `maxDistance` (quãng đường tối đa một route).
- Kho `warehouse` (dùng trong tính khoảng cách depot–first–…–last–depot).

**Output:**

- `Map<String, RouteAssignment>`: mỗi xe có danh sách `itemIds` theo **thứ tự giao** do decode quyết định, và `totalDistance` của route đó.
- `undeliveredItemIds`: các kiện không thể gán mà không vi phạm ràng buộc.

Đây là biến thể **có thể bỏ bớt kiện** khi ràng buộc không cho phép giao hết — phù hợp Basic Requirement 1 trong đề.

## 6.2 Objective Function *(đúng `GASolver.java`)*

Không dùng một biểu thức đơn giản “max đơn rồi min distance” tách rời mà gom vào **lexicographic ordering + fitness scalar**:

- So sánh hai nghiệm (`SOLUTION_COMPARATOR`): **cao hơn** nếu `deliveredCount` lớn hơn; nếu bằng thì **tốt hơn** nếu `totalDistance` **nhỏ hơn**.
- Fitness scalar dùng khi chọn tournament / elite:  
  \(\text{fitness} = \text{deliveredCount} \times 10^6 - \text{totalDistance}\)  
  (`BIG_CONSTANT = 1_000_000.0`).

Như vậy **ưu tiên tuyệt đối** cho số kiện giao được, sau đó mới tối ưu tổng quãng đường trong phạm vi cùng số kiện.

## 6.3 Algorithm Used

**Genetic Algorithm (GA)** — lớp `GASolver` (`optimizer/GASolver.java`). Đây là kỹ thuật tối ưu **tự cài**, không gọi thư viện OR-Tools/OptaPlanner trong mã nguồn Java solver.

## 6.4 Algorithm Details *(theo file `GASolver.java`)*

### 6.4.1 Encoding (chromosome)

- Mỗi cá thể là một mảng `int[]` độ dài `n` = số kiện.
- Nội dung là **một hoán vị** của các chỉ số gene `0 .. n-1` (mỗi chỉ số là chỉ số vào `List<DeliveryItem> items`).
- Khởi tạo quần thể: xáo trộn ngẫu nhiên tng cá thể (`initializePopulation`).

### 6.4.2 Decoding (gán kiện cho xe)

Với từng gene theo thứ tự trong chromosome:

- Lấy kiện `items.get(gene)`.
- Thử gán vào xe theo vòng: bắt đầu từ `vehicles.get(vehicleIndex % size)`, tối đa `vehicles.size()` lần thử cho một gene.
- Một kiện được gán nếu:
  - Số kiện trên xe sau khi thêm **≤ `capacity`**, và
  - Quãng đường route thử (warehouse → … → warehouse) **≤ `maxDistance`** (`calculateRouteDistance` trên `trialRoute`).

Nếu sau vòng thử vẫn không gán được → thêm `candidateItem.getId()` vào `undelivered`.

Sau cùng, với mỗi xe tạo `RouteAssignment(vehicleId, itemIds, totalDistance)`; `totalDistance` tính lại từ thứ tự kiện đã gán.

### 6.4.3 Genetic operators

- **Selection:** `tournamentSelect` — chọn ngẫu nhiên `tournamentSize` cá thể, lấy cá thể **tốt nhất** theo `SOLUTION_COMPARATOR`.
- **Crossover:** với xác suất `crossoverRate`, dùng **Order Crossover (OX)** `orderCrossover(parent1, parent2)`; ngược lại copy `parent1`.
- **Mutation:** với xác suất `mutationRate`, **đổi chỗ hai gene** (`swapMutation`).
- **Elitism:** chép `eliteCount` cá thể tốt nhất sang thế hệ sau (`eliteSize` từ config, trong code bị giới hạn `[1, populationSize]`).

### 6.4.4 Tham số mặc định (`GAConfig.defaultConfig()`)

- `populationSize = 40`
- `generations = 100`
- `tournamentSize = 3`
- `eliteSize = 1` (constructor 5 tham số gọi overload với elite = 1)
- `crossoverRate = 0.8`
- `mutationRate = 0.2`

GUI có thể ghi đè `populationSize`, `generations`, `mutationRate`, `eliteSize` qua JSON.

### 6.4.5 Validation

`validateDecodeResult` kiểm tra: không trùng kiện giữa các xe và undelivered; capacity và maxDistance; tổng số kiện khớp; `deliveredCount` và `totalDistance` khớp khi đếm lại — hữu ích khi báo cáo về **độ tin cậy** của decode.

## 6.5 Constraints Handling

| Ràng buộc | Cách xử lý trong code |
|-----------|------------------------|
| Capacity | Kiểm tra `currentItems.size() < vehicle.getCapacity()` trước khi thêm kiện vào `trialRoute` (`decode`). |
| Max distance mỗi xe | `calculateRouteDistance(trialRoute) <= vehicle.getMaxDistance()`. |
| Depot | Route luôn bắt đầu từ warehouse tới kiện đầu, giữa các kiện Euclidean, cuối về warehouse (`calculateRouteDistance`). |
| Không giao hết | Kiện thừa → `undelivered`; fitness vẫn ưu tiên số kiện đã giao tối đa có thể trong không gian heuristic. |

## 6.6 Complexity Analysis *(ước lượng — ăn điểm phân tích)*

Gọi \(n\) = số kiện, \(P\) = `populationSize`, \(G\) = `generations`, \(k\) = số xe.

- **Một lần `calculateRouteDistance`** trên route độ dài \(m\): \(O(m)\).
- **Decode một chromosome:** vòng ngoài \(n\) gene; mỗi gene tối đa \(k\) lần thử; mỗi lần thử tính distance trên route tối đa \(O(n)\) → **ước lượng xấu nhất \(O(n^2 k)\)** per chromosome (thực tế \(m\) nhỏ hơn khi capacity nhỏ).
- **Một thế hệ:** đánh giá \(P\) chromosome → **\(O(P \cdot n^2 k)\)**.
- **Toàn bộ GA:** **\(O(G \cdot P \cdot n^2 k)\)**.

**Khả năng mở rộng:** khi \(n\) hoặc \(G\) lớn, thời gian tăng nhanh; có thể trade-off bằng giảm `generations`/`populationSize` trên GUI hoặc tối ưu decode (cache khoảng cách cặp điểm). Bộ nhớ: lưu quần thể \(O(P \cdot n)\) số nguyên.

---

# 7. System Implementation *(khuyến nghị 1 – 1.5 trang)*

## 7.1 Tech Stack *(đúng repo)*

| Lớp | Công nghệ |
|-----|-----------|
| Ngôn ngữ lõi | **Java** |
| Đa agent | **JADE** (`jade.*` trong `MasterRoutingAgent`, `DeliveryAgent`, `Main`) |
| HTTP API | **`com.sun.net.httpserver.HttpServer`** (`BackendApiServer.java`, cổng **8080**) |
| Parse JSON request | **`javax.script.ScriptEngine`** (`Java.asJSONCompatible`) — phụ thuộc JDK; cần lưu ý khi port JDK |
| GUI | **React + TypeScript + Vite** (`frontend/Vehicle-Routing-System-main/`) |
| Styling / component | Tailwind-style CSS, Radix/shadcn-like UI components trong `src/app/components/ui/` |

**OR-Tools / OptaPlanner:** **không** được tích hợp làm solver trong mã Java của đồ án này (chỉ có thể được nhắn như tài liệu tham khảo trong `README` frontend).

## 7.2 Key Features *(liệt kê theo code)*

1. **Sinh dữ liệu tự động:** số kiện ngẫu nhiên (`generateRandomItems` / `generateItemsArray`), kịch bản `balanced`, `overcapacity`, `limited` (`SetupPage.tsx`).
2. **Đọc file input:**  
   - JSON cấu hình đầy đủ (warehouse, items, vehicles).  
   - Text `id,x,y` (giống format `DeliveryItemParser` cho từng dòng kiện).
3. **Export cấu hình JSON** (`handleDownloadConfig`).
4. **Chạy solver không GUI:** `BackendDemoRunner.java` — đọc file kiện, hai xe cố định `da1`/`da2`, in kết quả console.
5. **Visualization:** fetch `POST /solve`, hiển thị route + undelivered + stats + agent message panel.

## 7.3 System Workflow

**JADE:** `Main` khởi tạo container → start MRA + DAs → DA gửi capacity → MRA đủ xe → parse items từ file → `RoutingService` → gửi route → DA ACK.

**Web:** Setup → lưu `config` vào context → Visualization → `fetch('http://localhost:8080/solve')` với JSON → hiển thị kết quả + mô phỏng message.

---

# 8. Scenarios / Demonstration *(khuyến nghị 1 – 1.5 trang)*

## 8.1 Test Case 1 — Nhiều xe, nhiều kiện, đủ ràng buộc

- **Cách 1 (file):** `data/items.txt` hiện có 6 dòng kiện; chạy `Main.java` hoặc `BackendDemoRunner` với file này; hai xe mặc định trong `Main` / `BackendDemoRunner` (`capacity` 3 và 4, `maxDistance` 100 và 120).
- **Cách 2 (GUI):** chọn kịch bản **balanced** trên Setup (15 kiện, 3 xe capacity 5, maxDistance 120) rồi Optimize — quan sát map và `totalItemsDelivered`.

**Kỳ vọng:** thường giao được toàn bộ hoặc gần hết nếu ràng buộc đủ lỏng; kiểm tra `totalDistance` từng route trong JSON/UI.

## 8.2 Test Case 2 — Tổng capacity < số kiện

- Trên **SetupPage**, kịch bản **`overcapacity`**: 25 kiện clustered, tổng capacity xe nhỏ hơn 25 (ví dụ 6+6+5).
- **Chứng minh trong báo cáo:** chụp màn hình phần **undelivered items** và số **delivered**; giải thích fitness ưu tiên số kiện tối đa có thể.

## 8.3 Test Case 3 — Max distance chặt (Basic Requirement 2)

- Kịch bản **`limited`:** kiện có cả cụm gần kho và cụm xa; xe `maxDistance = 70`, capacity đủ nhưng đường không đủ cho mọi kiện xa.
- **Kỳ vọng:** một số kiện vào `undeliveredItems` hoặc phân bổ khác; tổng quãng đường mỗi xe ≤ maxDistance (kiểm tra JSON `totalDistance` từng route).

## 8.4 Visualization *(bắt buộc có hình khi nộp)*

- Chụp **Setup** (warehouse, danh sách xe, GA params).
- Chụp **Visualization**: map có màu theo xe, legend, phần **Agent Communication** và **SolutionStats**.

---

# 9. Critical Analysis *(rất quan trọng — ~1 trang)*

## 9.1 Strengths

- **Đúng yêu cầu đa agent JADE** với ACL và `conversationId` rõ ràng, ACK hai chiều.
- **GA tự triển khai** có encoding, decode ràng buộc, OX, mutation, tournament, elitism và **validator** nội bộ.
- **Hai đường demo:** console/JADE và GUI + REST, dùng chung `RoutingService` / `GASolver` — dễ demo với tutor.
- **GUI linh hoạt:** sinh dữ liệu, kịch bản minh họa đúng hai basic requirements, load/export JSON và text.
- **Khoảng cách** đúng spec Euclidean, tách lớp `DistanceCalculator`.

## 9.2 Limitations

- GA + decode greedy **không đảm bảo optimal toàn cục**; phụ thuộc tham số và may mắn khởi tạo.
- **Thứ tự thử xe** trong `decode` ảnh hưởng lớn tới chất lượng; khác với mô hình “gán tập kiện cho xe rồi TSP con”.
- **Hai luồng triển khai:** tutor cần thấy rõ phần **JADE thật** vs **mô phỏng message trên web** sau REST.
- **JSON parsing** qua ScriptEngine có thể phiền trên một số bản JDK / cần module flags.

## 9.3 Improvements

- **VRPTW:** mở rộng gene / decode và penalty cho time window.
- **Bản đồ thật / đường đi:** tích hợp routing OSM, không chỉ Euclidean.
- **Meta-heuristic lai:** lai 2-opt trên từng route sau decode; hoặc local search.
- **JSON chuẩn:** dùng Jackson/Gson thay ScriptEngine.
- **MRA nhận items qua ACL** để đồng nhất hoàn toàn với mô tả “MRA nhận input list từ nguồn agent” (hiện items chủ yếu từ file trong JADE).

---

# 10. Conclusion *(~0.5 trang)*

Đồ án đã xây dựng **hệ thống VRP** với **MRA và nhiều DA trên JADE**, giao thức **ACL có sequence rõ ràng**, và **tối ưu Genetic Algorithm** xử lý **ưu tiên số kiện giao**, **ràng buộc capacity và max distance**, kèm **GUI React** và **HTTP API** dùng chung lõi Java. Các mở rộng đề bài (time window, đấu thầu) chưa nằm trong code nhưng là hướng phát triển hợp lý cho research component.

---

# 11. References

1. Google Developers — *Vehicle Routing Problem* — https://developers.google.com/optimization/routing/vrp  
2. Google Developers — *VRP with Time Windows* — https://developers.google.com/optimization/routing/vrptw  
3. JADE — Java Agent DEvelopment Framework — tài liệu chính thức JADE / tutorials multi-agent.  
4. Tài liệu môn / đề bài: **COS30018 Project Assignment – Option A** (PDF đề).  
5. (Tuỳ chọn) Bài báo GA cho VRP / survey VRP nếu nhóm có trích dẫn học thuật.

---

## Phụ lục: Checklist “ăn điểm” theo outline

- [ ] Hình **architecture** (sơ đồ mục 4.1).  
- [ ] Hình **UML sequence** (Mục 5.2).  
- [ ] **Screenshot GUI** (Mục 8.4).  
- [ ] Mô tả **GA cụ thể** (Mục 6), không chung chung.  
- [ ] **Critical analysis** trung thực (Mục 9).  

---

*Hết file. Chỉnh tên thành viên, tutor, ngày nộp, và chèn hình khi xuất bản Word/PDF.*
