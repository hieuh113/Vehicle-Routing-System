import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import model.DeliveryItem;
import model.GAConfig;
import model.RouteAssignment;
import model.RoutingRequest;
import model.RoutingResponse;
import model.VehicleInfo;
import model.Warehouse;
import service.RoutingService;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class BackendApiServer {

    private static final int PORT = 8080;

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/solve", new SolveHandler());
        server.setExecutor(null);
        server.start();
        System.out.println("Backend API server running at http://localhost:" + PORT);
        System.out.println("POST /solve to run the Java RoutingService + GASolver backend.");
    }

    private static class SolveHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange.getResponseHeaders());

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                send(exchange, 204, "");
                return;
            }

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                send(exchange, 405, "{\"error\":\"Only POST is supported\"}");
                return;
            }

            try {
                String requestBody = readBody(exchange.getRequestBody());
                RoutingRequest request = parseRoutingRequest(requestBody);
                RoutingResponse response = new RoutingService().solve(request);
                String json = toJsonResponse(response, request.getItems());
                send(exchange, 200, json);
            } catch (Exception e) {
                e.printStackTrace();
                send(exchange, 500, "{\"error\":\"" + escape(e.getMessage()) + "\"}");
            }
        }
    }

    private static void addCorsHeaders(Headers headers) {
        headers.add("Access-Control-Allow-Origin", "*");
        headers.add("Access-Control-Allow-Methods", "POST, OPTIONS");
        headers.add("Access-Control-Allow-Headers", "Content-Type");
        headers.add("Content-Type", "application/json; charset=UTF-8");
    }

    private static String readBody(InputStream inputStream) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        byte[] buffer = new byte[4096];
        int read;
        while ((read = inputStream.read(buffer)) != -1) {
            outputStream.write(buffer, 0, read);
        }
        return new String(outputStream.toByteArray(), StandardCharsets.UTF_8);
    }

    private static void send(HttpExchange exchange, int statusCode, String body) throws IOException {
        byte[] responseBytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, responseBytes.length);
        try (OutputStream outputStream = exchange.getResponseBody()) {
            outputStream.write(responseBytes);
        }
    }

    @SuppressWarnings("unchecked")
    private static RoutingRequest parseRoutingRequest(String json) throws Exception {
        ScriptEngine engine = new ScriptEngineManager().getEngineByName("javascript");
        if (engine == null) {
            throw new IllegalStateException("JavaScript engine is not available for JSON parsing.");
        }

        Object parsed = engine.eval("Java.asJSONCompatible(" + json + ")");
        Map<String, Object> root = (Map<String, Object>) parsed;

        Map<String, Object> warehouseMap = (Map<String, Object>) root.get("warehouse");
        Warehouse warehouse = new Warehouse(
                toDouble(warehouseMap.get("x")),
                toDouble(warehouseMap.get("y"))
        );

        List<DeliveryItem> items = new ArrayList<>();
        List<Object> rawItems = (List<Object>) root.get("deliveryItems");
        for (Object rawItem : rawItems) {
            Map<String, Object> itemMap = (Map<String, Object>) rawItem;
            Map<String, Object> location = (Map<String, Object>) itemMap.get("location");
            double earliestTime = getDoubleOrDefault(itemMap, "earliestTime", 0.0);
            double latestTime = getDoubleOrDefault(itemMap, "latestTime", Double.MAX_VALUE);
            double serviceTime = getDoubleOrDefault(itemMap, "serviceTime", 0.0);

            items.add(new DeliveryItem(
                    parseNumericId(itemMap.get("id").toString()),
                    toDouble(location.get("x")),
                    toDouble(location.get("y")),
                    earliestTime,
                    latestTime,
                    serviceTime
            ));
        }

        List<VehicleInfo> vehicles = new ArrayList<>();
        List<Object> rawVehicles = (List<Object>) root.get("vehicles");
        for (Object rawVehicle : rawVehicles) {
            Map<String, Object> vehicleMap = (Map<String, Object>) rawVehicle;
            vehicles.add(new VehicleInfo(
                    vehicleMap.get("id").toString(),
                    toInt(vehicleMap.get("capacity")),
                    toDouble(vehicleMap.get("maxDistance"))
            ));
        }

        GAConfig gaConfig = new GAConfig(
                getIntOrDefault(root, "populationSize", GAConfig.defaultConfig().getPopulationSize()),
                getIntOrDefault(root, "generations", GAConfig.defaultConfig().getGenerations()),
                getIntOrDefault(root, "tournamentSize", GAConfig.defaultConfig().getTournamentSize()),
                getIntOrDefault(root, "eliteSize", GAConfig.defaultConfig().getEliteSize()),
                getDoubleOrDefault(root, "crossoverRate", GAConfig.defaultConfig().getCrossoverRate()),
                getDoubleOrDefault(root, "mutationRate", GAConfig.defaultConfig().getMutationRate())
        );

        return new RoutingRequest(warehouse, items, vehicles, gaConfig);
    }

    private static String toJsonResponse(RoutingResponse response, List<DeliveryItem> items) {
        Map<Integer, DeliveryItem> itemById = new HashMap<>();
        for (DeliveryItem item : items) {
            itemById.put(item.getId(), item);
        }

        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"solution\":{");
        json.append("\"routes\":[");

        boolean firstRoute = true;
        for (RouteAssignment assignment : response.getAssignments().values()) {
            if (!firstRoute) {
                json.append(",");
            }
            firstRoute = false;

            json.append("{");
            appendField(json, "vehicleId", assignment.getVehicleId()).append(",");
            json.append("\"stops\":[");

            boolean firstStop = true;
            for (Integer itemId : assignment.getItemIds()) {
                if (!firstStop) {
                    json.append(",");
                }
                firstStop = false;
                appendDeliveryItem(json, itemById.get(itemId));
            }

            json.append("],");
            appendField(json, "totalDistance", assignment.getTotalDistance()).append(",");
            appendField(json, "itemsDelivered", assignment.getItemIds().size());
            json.append("}");
        }

        json.append("],");
        appendField(json, "totalItemsDelivered", response.getDeliveredCount()).append(",");
        appendField(json, "totalDistance", response.getTotalDistance()).append(",");
        json.append("\"undeliveredItems\":[");

        boolean firstUndelivered = true;
        for (Integer itemId : response.getUndeliveredItemIds()) {
            if (!firstUndelivered) {
                json.append(",");
            }
            firstUndelivered = false;
            appendDeliveryItem(json, itemById.get(itemId));
        }

        json.append("]");
        json.append("},");
        appendField(json, "bestFitness", response.getBestFitness()).append(",");
        appendField(json, "bestGeneration", response.getBestGeneration());
        json.append("}");

        return json.toString();
    }

    private static void appendDeliveryItem(StringBuilder json, DeliveryItem item) {
        json.append("{");
        appendField(json, "id", "item-" + item.getId()).append(",");
        appendField(json, "earliestTime", item.getEarliestTime()).append(",");
        appendField(json, "latestTime", item.getLatestTime()).append(",");
        appendField(json, "serviceTime", item.getServiceTime()).append(",");
        json.append("\"location\":{");
        appendField(json, "x", item.getX()).append(",");
        appendField(json, "y", item.getY()).append(",");
        appendField(json, "id", "loc-" + item.getId()).append(",");
        appendField(json, "label", "Item " + item.getId());
        json.append("}");
        json.append("}");
    }

    private static StringBuilder appendField(StringBuilder json, String key, String value) {
        json.append("\"").append(escape(key)).append("\":\"").append(escape(value)).append("\"");
        return json;
    }

    private static StringBuilder appendField(StringBuilder json, String key, int value) {
        json.append("\"").append(escape(key)).append("\":").append(value);
        return json;
    }

    private static StringBuilder appendField(StringBuilder json, String key, double value) {
        json.append("\"").append(escape(key)).append("\":").append(value);
        return json;
    }

    private static int parseNumericId(String id) {
        String digits = id.replaceAll("[^0-9]", "");
        if (digits.isEmpty()) {
            throw new IllegalArgumentException("Item id must contain a number: " + id);
        }
        return Integer.parseInt(digits);
    }

    private static int getIntOrDefault(Map<String, Object> map, String key, int defaultValue) {
        Object value = map.get(key);
        return value == null ? defaultValue : toInt(value);
    }

    private static double getDoubleOrDefault(Map<String, Object> map, String key, double defaultValue) {
        Object value = map.get(key);
        return value == null ? defaultValue : toDouble(value);
    }

    private static int toInt(Object value) {
        return ((Number) value).intValue();
    }

    private static double toDouble(Object value) {
        return ((Number) value).doubleValue();
    }

    private static String escape(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}
