package model;

public class Warehouse {
    private final double x;
    private final double y;

    public Warehouse(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public static Warehouse defaultWarehouse() {
        return new Warehouse(0.0, 0.0);
    }

    public double getX() {
        return x;
    }

    public double getY() {
        return y;
    }

    @Override
    public String toString() {
        return "Warehouse{" +
                "x=" + x +
                ", y=" + y +
                '}';
    }
}
