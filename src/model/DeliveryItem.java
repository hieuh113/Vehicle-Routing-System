package model;

public class DeliveryItem {
    private final int id;
    private final double x;
    private final double y;
    private final double earliestTime;
    private final double latestTime;
    private final double serviceTime;

    public DeliveryItem(int id, double x, double y) {
        this(id, x, y, 0.0, Double.MAX_VALUE, 0.0);
    }

    public DeliveryItem(int id,
                        double x,
                        double y,
                        double earliestTime,
                        double latestTime,
                        double serviceTime) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.earliestTime = earliestTime;
        this.latestTime = latestTime;
        this.serviceTime = serviceTime;
    }

    public int getId() {
        return id;
    }

    public double getX() {
        return x;
    }

    public double getY() {
        return y;
    }

    public double getEarliestTime() {
        return earliestTime;
    }

    public double getLatestTime() {
        return latestTime;
    }

    public double getServiceTime() {
        return serviceTime;
    }

    @Override
    public String toString() {
        return "DeliveryItem{" +
                "id=" + id +
                ", x=" + x +
                ", y=" + y +
                ", earliestTime=" + earliestTime +
                ", latestTime=" + latestTime +
                ", serviceTime=" + serviceTime +
                '}';
    }
}
