package model;

import java.util.List;

public class RouteAssignment {
    private final String vehicleId;
    private final List<Integer> itemIds;
    private final double totalDistance;

    public RouteAssignment(String vehicleId, List<Integer> itemIds, double totalDistance) {
        this.vehicleId = vehicleId;
        this.itemIds = itemIds;
        this.totalDistance = totalDistance;
    }

    public String getVehicleId() {
        return vehicleId;
    }

    public List<Integer> getItemIds() {
        return itemIds;
    }

    public double getTotalDistance() {
        return totalDistance;
    }

    @Override
    public String toString() {
        return "RouteAssignment{" +
                "vehicleId='" + vehicleId + '\'' +
                ", itemIds=" + itemIds +
                ", totalDistance=" + totalDistance +
                '}';
    }
}
