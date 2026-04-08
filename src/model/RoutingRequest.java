package model;

import java.util.List;

public class RoutingRequest {
    private final Warehouse warehouse;
    private final List<DeliveryItem> items;
    private final List<VehicleInfo> vehicles;
    private final GAConfig gaConfig;

    public RoutingRequest(Warehouse warehouse,
                          List<DeliveryItem> items,
                          List<VehicleInfo> vehicles,
                          GAConfig gaConfig) {
        this.warehouse = warehouse;
        this.items = items;
        this.vehicles = vehicles;
        this.gaConfig = gaConfig;
    }

    public static RoutingRequest withDefaults(List<DeliveryItem> items, List<VehicleInfo> vehicles) {
        return new RoutingRequest(
                Warehouse.defaultWarehouse(),
                items,
                vehicles,
                GAConfig.defaultConfig()
        );
    }

    public Warehouse getWarehouse() {
        return warehouse;
    }

    public List<DeliveryItem> getItems() {
        return items;
    }

    public List<VehicleInfo> getVehicles() {
        return vehicles;
    }

    public GAConfig getGaConfig() {
        return gaConfig;
    }
}
