package util;

import model.DeliveryItem;
import model.Warehouse;

public class DistanceCalculator {

    private DistanceCalculator() {
    }

    public static double distance(double x1, double y1, double x2, double y2) {
        double dx = x1 - x2;
        double dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    public static double fromWarehouse(DeliveryItem item) {
        return fromWarehouse(Warehouse.defaultWarehouse(), item);
    }

    public static double fromWarehouse(Warehouse warehouse, DeliveryItem item) {
        return distance(warehouse.getX(), warehouse.getY(), item.getX(), item.getY());
    }

    public static double between(DeliveryItem a, DeliveryItem b) {
        return distance(a.getX(), a.getY(), b.getX(), b.getY());
    }

    public static double backToWarehouse(DeliveryItem item) {
        return backToWarehouse(item, Warehouse.defaultWarehouse());
    }

    public static double backToWarehouse(DeliveryItem item, Warehouse warehouse) {
        return distance(item.getX(), item.getY(), warehouse.getX(), warehouse.getY());
    }
}
