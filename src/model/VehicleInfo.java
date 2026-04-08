package model;

public class VehicleInfo {
    private final String vehicleId;
    private final int capacity;
    private final double maxDistance;

    public VehicleInfo(String vehicleId, int capacity, double maxDistance) {
        this.vehicleId = vehicleId;
        this.capacity = capacity;
        this.maxDistance = maxDistance;
    }

    public String getVehicleId() {
        return vehicleId;
    }

    public int getCapacity() {
        return capacity;
    }

    public double getMaxDistance() {
        return maxDistance;
    }

    @Override
    public String toString() {
        return "VehicleInfo{" +
                "vehicleId='" + vehicleId + '\'' +
                ", capacity=" + capacity +
                ", maxDistance=" + maxDistance +
                '}';
    }
}
