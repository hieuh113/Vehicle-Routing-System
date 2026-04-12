package util;

import model.DeliveryItem;
import model.Warehouse;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class RouteTimeEvaluator {

    private RouteTimeEvaluator() {
    }

    public static RouteTimeResult evaluate(Warehouse warehouse, List<DeliveryItem> route) {
        if (route == null || route.isEmpty()) {
            return new RouteTimeResult(true, Collections.<Double>emptyList(), Collections.<Double>emptyList(), 0.0);
        }

        List<Double> arrivalTimes = new ArrayList<>();
        List<Double> startServiceTimes = new ArrayList<>();

        double currentTime = 0.0;
        DeliveryItem previous = null;

        for (DeliveryItem current : route) {
            double travelTime = previous == null
                    ? DistanceCalculator.fromWarehouse(warehouse, current)
                    : DistanceCalculator.between(previous, current);

            double arrivalTime = currentTime + travelTime;
            if (arrivalTime > current.getLatestTime()) {
                arrivalTimes.add(arrivalTime);
                startServiceTimes.add(arrivalTime);
                return new RouteTimeResult(false, arrivalTimes, startServiceTimes, arrivalTime);
            }

            double startServiceTime = Math.max(arrivalTime, current.getEarliestTime());
            currentTime = startServiceTime + current.getServiceTime();

            arrivalTimes.add(arrivalTime);
            startServiceTimes.add(startServiceTime);
            previous = current;
        }

        return new RouteTimeResult(true, arrivalTimes, startServiceTimes, currentTime);
    }

    public static final class RouteTimeResult {
        private final boolean feasible;
        private final List<Double> arrivalTimes;
        private final List<Double> startServiceTimes;
        private final double finishTime;

        private RouteTimeResult(boolean feasible,
                                List<Double> arrivalTimes,
                                List<Double> startServiceTimes,
                                double finishTime) {
            this.feasible = feasible;
            this.arrivalTimes = Collections.unmodifiableList(new ArrayList<>(arrivalTimes));
            this.startServiceTimes = Collections.unmodifiableList(new ArrayList<>(startServiceTimes));
            this.finishTime = finishTime;
        }

        public boolean isFeasible() {
            return feasible;
        }

        public List<Double> getArrivalTimes() {
            return arrivalTimes;
        }

        public List<Double> getStartServiceTimes() {
            return startServiceTimes;
        }

        public double getFinishTime() {
            return finishTime;
        }
    }
}
