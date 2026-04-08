import model.DeliveryItem;
import model.RouteAssignment;
import model.RoutingRequest;
import model.RoutingResponse;
import model.VehicleInfo;
import parser.DeliveryItemParser;
import service.RoutingService;

import java.util.ArrayList;
import java.util.List;

public class BackendDemoRunner {

    private static final String DEFAULT_ITEMS_FILE = "data/items.txt";

    public static void main(String[] args) {
        String itemsFilePath = args.length >= 1 ? args[0] : DEFAULT_ITEMS_FILE;

        DeliveryItemParser parser = new DeliveryItemParser();
        List<DeliveryItem> items = parser.parse(itemsFilePath);
        List<VehicleInfo> vehicles = createDefaultVehicles();

        RoutingRequest request = RoutingRequest.withDefaults(items, vehicles);
        RoutingResponse response = new RoutingService().solve(request);

        printResult(itemsFilePath, items, vehicles, response);
    }

    private static List<VehicleInfo> createDefaultVehicles() {
        List<VehicleInfo> vehicles = new ArrayList<>();
        vehicles.add(new VehicleInfo("da1", 3, 100.0));
        vehicles.add(new VehicleInfo("da2", 4, 120.0));
        return vehicles;
    }

    private static void printResult(String itemsFilePath,
                                    List<DeliveryItem> items,
                                    List<VehicleInfo> vehicles,
                                    RoutingResponse response) {
        System.out.println("Backend demo runner");
        System.out.println("Items file: " + itemsFilePath);
        System.out.println("Items loaded: " + items.size());
        System.out.println("Vehicles: " + vehicles.size());
        System.out.println();

        System.out.println("GA best fitness: " + response.getBestFitness());
        System.out.println("GA best generation: " + response.getBestGeneration());
        System.out.println("Delivered items: " + response.getDeliveredCount());
        System.out.println("Undelivered items: " + response.getUndeliveredItemIds());
        System.out.println("Total distance: " + response.getTotalDistance());
        System.out.println();

        System.out.println("Assignments:");
        for (RouteAssignment assignment : response.getAssignments().values()) {
            System.out.println("- " + assignment);
        }
    }
}
