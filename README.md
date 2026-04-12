# Delivery Vehicle Routing System

This repository contains the implementation for the COS30018 Intelligent Systems project: a delivery vehicle routing system built with:

- Java
- JADE multi-agent system
- a custom Genetic Algorithm
- a React frontend

The project supports:

- baseline routing with vehicle capacity and maximum route distance
- a backend prototype for Extension 1: VRPTW (time windows)

This guide explains how to set up the project from a fresh clone and how to record a complete demo video.

## 1. Prerequisites

Before running the project, make sure the machine has the following installed:

- `Git`
- `Java JDK 8`
- `Node.js` and `npm`
- `JADE` library (`jade.jar`)

## 2. Clone the Repository

Open PowerShell and run:

```powershell
git clone https://github.com/hieuh113/Vehicle-Routing-System.git
cd Vehicle-Routing-System
```

If your cloned folder name is different, use that folder instead.

## 3. Prepare the JADE Library

Create a local folder named `libs` in the project root and place `jade.jar` inside it:

```text
Vehicle-Routing-System/
  libs/
    jade.jar
```

If you already have JADE installed somewhere else, you can still use it, but you must update the classpath in the commands below.

## 4. Project Structure

Important folders and files:

- `src/`  
  Java backend, JADE agents, solver, parser, and API server
- `data/`  
  local test input files
- `frontend/Vehicle-Routing-System-main/`  
  React frontend
- `src/Main.java`  
  starts the JADE multi-agent workflow
- `src/BackendApiServer.java`  
  starts the backend API for the frontend
- `src/BackendDemoRunner.java`  
  runs backend-only tests without JADE

## 5. Compile the Java Backend

From the project root, run:

```powershell
& "C:\Program Files\Eclipse Adoptium\jdk-8.0.482.8-hotspot\bin\javac.exe" -cp "libs\jade.jar" -d out\production\ProjectA_COS30018 src\Main.java src\BackendDemoRunner.java src\BackendApiServer.java src\agents\*.java src\model\*.java src\optimizer\*.java src\parser\*.java src\util\*.java src\service\*.java
```

If your Java path is different, replace it with your own `javac.exe` path.

## 6. Install Frontend Dependencies

Move to the frontend folder:

```powershell
cd frontend\Vehicle-Routing-System-main
npm install
cd ..\..
```

This only needs to be done once on a fresh machine.

## 7. Run the Backend API for the Frontend

From the project root, start the backend API server:

```powershell
& "C:\Program Files\Eclipse Adoptium\jdk-8.0.482.8-hotspot\bin\java.exe" -cp "out\production\ProjectA_COS30018;libs\jade.jar" BackendApiServer
```

Expected output:

```text
Backend API server running at http://localhost:8080
POST /solve to run the Java RoutingService + GASolver backend.
```

Keep this terminal open while using the frontend.

## 8. Run the Frontend

Open a second PowerShell window and run:

```powershell
cd frontend\Vehicle-Routing-System-main
npm run dev
```

Then open the local Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

## 9. Run the JADE Multi-Agent Demo

If you want to demonstrate the JADE agent workflow, run this from the project root in another terminal:

```powershell
& "C:\Program Files\Eclipse Adoptium\jdk-8.0.482.8-hotspot\bin\java.exe" -cp "out\production\ProjectA_COS30018;libs\jade.jar" Main "data\Test4A1.txt"
```

This will:

- open the JADE main container
- start `mra`
- start `da1`
- start `da2`
- run the full registration -> assignment -> acknowledgment protocol

You can also replace the input file:

```powershell
& "C:\Program Files\Eclipse Adoptium\jdk-8.0.482.8-hotspot\bin\java.exe" -cp "out\production\ProjectA_COS30018;libs\jade.jar" Main "data\Test4A2.txt"
```

## 10. Run Backend-Only Test Scenarios

The easiest way to demonstrate solver behavior is to use `BackendDemoRunner`.

### Test 1: Normal delivery case

```powershell
& "C:\Program Files\Eclipse Adoptium\jdk-8.0.482.8-hotspot\bin\java.exe" -cp "out\production\ProjectA_COS30018;libs\jade.jar" BackendDemoRunner "data\Test4A1.txt"
```

Expected result:

- all items should be delivered
- no undelivered items

### Test 2: Capacity constraint case

```powershell
& "C:\Program Files\Eclipse Adoptium\jdk-8.0.482.8-hotspot\bin\java.exe" -cp "out\production\ProjectA_COS30018;libs\jade.jar" BackendDemoRunner "data\Test4A2.txt"
```

Expected result:

- some items should remain undelivered
- the result demonstrates the capacity limit

### Test 3: Maximum distance constraint case

```powershell
& "C:\Program Files\Eclipse Adoptium\jdk-8.0.482.8-hotspot\bin\java.exe" -cp "out\production\ProjectA_COS30018;libs\jade.jar" BackendDemoRunner "data\Test4A3.txt"
```

Expected result:

- some items should remain undelivered
- the result demonstrates the maximum route distance limit

### Test 4: VRPTW prototype case 1

```powershell
& "C:\Program Files\Eclipse Adoptium\jdk-8.0.482.8-hotspot\bin\java.exe" -cp "out\production\ProjectA_COS30018;libs\jade.jar" BackendDemoRunner "data\TestVRPTW1.txt"
```

Expected result:

- the backend should parse the extended six-column format
- most or all items should be delivered under wider time windows

### Test 5: VRPTW prototype case 2

```powershell
& "C:\Program Files\Eclipse Adoptium\jdk-8.0.482.8-hotspot\bin\java.exe" -cp "out\production\ProjectA_COS30018;libs\jade.jar" BackendDemoRunner "data\TestVRPTW2.txt"
```

Expected result:

- at least one item should become undelivered due to time-window infeasibility

## 11. Recommended Demo Video Structure

The following structure works well for a clear demo video.

### Part 1. Show the repository and setup

Show:

- cloned repository
- `src/`
- `data/`
- `frontend/Vehicle-Routing-System-main/`
- `libs/jade.jar`

Say:

- this project uses JADE agents, a custom Java Genetic Algorithm, and a React frontend
- the backend supports baseline routing constraints and a backend prototype of VRPTW

### Part 2. Show Java backend compilation

Run the compile command and briefly explain:

- Java backend classes are compiled into `out\production\ProjectA_COS30018`
- the classpath includes `jade.jar`

### Part 3. Show backend-only solver tests

Run:

- `BackendDemoRunner "data\Test4A1.txt"`
- `BackendDemoRunner "data\Test4A2.txt"`
- `BackendDemoRunner "data\Test4A3.txt"`

Explain:

- `Test4A1` shows the normal routing case
- `Test4A2` demonstrates capacity constraints
- `Test4A3` demonstrates maximum route distance constraints

Then run:

- `BackendDemoRunner "data\TestVRPTW1.txt"`
- `BackendDemoRunner "data\TestVRPTW2.txt"`

Explain:

- these two files demonstrate the backend prototype for Extension 1
- the second case shows an infeasible item caused by time-window constraints

### Part 4. Show JADE communication

Run:

```powershell
& "C:\Program Files\Eclipse Adoptium\jdk-8.0.482.8-hotspot\bin\java.exe" -cp "out\production\ProjectA_COS30018;libs\jade.jar" Main "data\Test4A1.txt"
```

Explain:

- `DeliveryAgent` sends `register-capacity`
- `MasterRoutingAgent` receives vehicle constraints
- `MasterRoutingAgent` invokes the solver
- route assignments are sent back to each delivery agent
- each DA responds with `route-ack`

### Part 5. Show frontend + backend integration

Start:

- `BackendApiServer`
- frontend `npm run dev`

Then show:

- problem setup in the frontend
- solving through the backend
- route visualization and statistics

Explain:

- the frontend uses the backend API at `http://localhost:8080/solve`
- the frontend is mainly designed for the baseline assignment requirements

## 12. Suggested Talking Points for the Demo

You can use the following short explanations while recording:

- The project uses a JADE-based multi-agent architecture with one `MasterRoutingAgent` and multiple `DeliveryAgent` instances.
- The routing logic is implemented using a custom Genetic Algorithm rather than an external solver.
- The baseline solver supports vehicle capacity and maximum route distance.
- The backend has also been extended with a prototype implementation for VRPTW using `earliestTime`, `latestTime`, and `serviceTime`.
- The frontend communicates with the Java backend through `BackendApiServer`.

## 13. Troubleshooting

### Backend cannot find `jade.jar`

Check:

- `libs\jade.jar` exists
- the classpath in the command points to the correct location

### Frontend says it cannot connect to Java backend

Make sure:

- `BackendApiServer` is running
- port `8080` is available
- the frontend is using the same machine and localhost

### `npm install` or `npm run dev` fails

Check:

- Node.js and npm are installed
- you are inside `frontend\Vehicle-Routing-System-main`

### JADE window does not open

Make sure:

- Java is installed correctly
- `jade.jar` is available in the classpath
- you are running `Main`, not `BackendApiServer`

## 14. Final Checklist Before Recording

- backend compiles successfully
- frontend dependencies are installed
- `BackendApiServer` starts on port `8080`
- frontend opens in the browser
- `BackendDemoRunner` works for `Test4A1`, `Test4A2`, `Test4A3`
- VRPTW prototype tests run successfully
- JADE agent workflow runs successfully

