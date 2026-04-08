package service;

import model.DeliveryItem;
import model.GAConfig;
import model.GASolverResult;
import model.RoutingRequest;
import model.RoutingResponse;
import model.VehicleInfo;
import model.Warehouse;
import optimizer.GASolver;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class RoutingService {

    public RoutingResponse solve(RoutingRequest request) {
        GASolverResult result = solve(
                request.getItems(),
                request.getVehicles(),
                request.getGaConfig(),
                request.getWarehouse()
        );
        return RoutingResponse.fromSolverResult(result);
    }

    public GASolverResult solve(List<DeliveryItem> items, List<VehicleInfo> vehicles) {
        return solve(items, vehicles, GAConfig.defaultConfig(), Warehouse.defaultWarehouse());
    }

    public GASolverResult solve(List<DeliveryItem> items, List<VehicleInfo> vehicles, GAConfig gaConfig) {
        return solve(items, vehicles, gaConfig, Warehouse.defaultWarehouse());
    }

    public GASolverResult solve(List<DeliveryItem> items,
                                List<VehicleInfo> vehicles,
                                GAConfig gaConfig,
                                Warehouse warehouse) {
        List<VehicleInfo> sortedVehicles = new ArrayList<>(vehicles);
        sortedVehicles.sort(Comparator.comparing(VehicleInfo::getVehicleId));

        GASolver solver = new GASolver(gaConfig, warehouse);
        return solver.solve(items, sortedVehicles);
    }
}
