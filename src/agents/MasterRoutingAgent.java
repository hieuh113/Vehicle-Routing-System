package agents;

import jade.core.AID;
import jade.core.Agent;
import jade.core.behaviours.CyclicBehaviour;
import jade.lang.acl.ACLMessage;
import model.DeliveryItem;
import model.RouteAssignment;
import model.RoutingRequest;
import model.RoutingResponse;
import model.VehicleInfo;
import parser.DeliveryItemParser;
import service.RoutingService;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class MasterRoutingAgent extends Agent {

    private static final String DEFAULT_ITEMS_FILE = "data/items.txt";

    private final Map<String, VehicleInfo> vehicles = new LinkedHashMap<>();
    private int expectedVehicles = 2;
    private List<DeliveryItem> items;
    private boolean routesSent = false;
    private String itemsFilePath = DEFAULT_ITEMS_FILE;

    @Override
    protected void setup() {
        System.out.println(getLocalName() + " started.");

        Object[] args = getArguments();
        if (args != null && args.length >= 1) {
            expectedVehicles = Integer.parseInt(args[0].toString());
        }
        if (args != null && args.length >= 2) {
            itemsFilePath = args[1].toString();
        }

        loadItems();

        addBehaviour(new CyclicBehaviour() {
            @Override
            public void action() {
                ACLMessage msg = receive();

                if (msg != null) {
                    if ("register-capacity".equals(msg.getConversationId())
                            && msg.getPerformative() == ACLMessage.INFORM) {

                        VehicleInfo vehicle = parseVehicleInfo(msg.getContent());
                        vehicles.put(vehicle.getVehicleId(), vehicle);

                        System.out.println(getLocalName() + " received capacity message from "
                                + msg.getSender().getLocalName());
                        System.out.println("Stored: " + vehicle);
                        System.out.println("Registered vehicles: " + vehicles.size() + "/" + expectedVehicles);

                        if (vehicles.size() == expectedVehicles && !routesSent) {
                            System.out.println("All vehicles registered. Running GA solver...");
                            runSolverAndSendAssignments();
                            routesSent = true;
                        }

                    } else if ("route-ack".equals(msg.getConversationId())
                            && msg.getPerformative() == ACLMessage.CONFIRM) {

                        System.out.println(getLocalName() + " received ACK from "
                                + msg.getSender().getLocalName());
                        System.out.println("ACK content: " + msg.getContent());
                    }

                } else {
                    block();
                }
            }
        });
    }

    private void loadItems() {
        DeliveryItemParser parser = new DeliveryItemParser();
        items = parser.parse(itemsFilePath);

        System.out.println("Loading items from: " + itemsFilePath);
        System.out.println("Loaded items:");
        for (DeliveryItem item : items) {
            System.out.println(item);
        }
    }

    private void runSolverAndSendAssignments() {
        RoutingService routingService = new RoutingService();
        List<VehicleInfo> vehicleList = new ArrayList<>(vehicles.values());
        RoutingRequest request = RoutingRequest.withDefaults(items, vehicleList);
        RoutingResponse response = routingService.solve(request);
        Map<String, RouteAssignment> assignments = response.getAssignments();

        System.out.println("GA best fitness: " + response.getBestFitness());
        System.out.println("GA best generation: " + response.getBestGeneration());
        System.out.println("Delivered items: " + response.getDeliveredCount());
        System.out.println("Undelivered items: " + response.getUndeliveredItemIds());
        System.out.println("Total distance: " + response.getTotalDistance());

        for (RouteAssignment assignment : assignments.values()) {
            ACLMessage msg = new ACLMessage(ACLMessage.INFORM);
            msg.addReceiver(new AID(assignment.getVehicleId(), AID.ISLOCALNAME));
            msg.setConversationId("route-assignment");
            msg.setContent("vehicleId=" + assignment.getVehicleId()
                    + ";items=" + assignment.getItemIds()
                    + ";distance=" + assignment.getTotalDistance());
            send(msg);

            System.out.println("Sent assignment: " + assignment);
        }
    }

    private VehicleInfo parseVehicleInfo(String content) {
        String[] parts = content.split(";");

        String vehicleId = "";
        int capacity = 0;
        double maxDistance = 0.0;

        for (String part : parts) {
            String[] keyValue = part.split("=");
            String key = keyValue[0];
            String value = keyValue[1];

            switch (key) {
                case "vehicleId":
                    vehicleId = value;
                    break;
                case "capacity":
                    capacity = Integer.parseInt(value);
                    break;
                case "maxDistance":
                    maxDistance = Double.parseDouble(value);
                    break;
            }
        }

        return new VehicleInfo(vehicleId, capacity, maxDistance);
    }
}
