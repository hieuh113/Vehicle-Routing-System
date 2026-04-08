package model;

import java.util.List;
import java.util.Map;

public class RoutingResponse {
    private final Map<String, RouteAssignment> assignments;
    private final List<Integer> undeliveredItemIds;
    private final int deliveredCount;
    private final double totalDistance;
    private final double bestFitness;
    private final int bestGeneration;

    public RoutingResponse(Map<String, RouteAssignment> assignments,
                           List<Integer> undeliveredItemIds,
                           int deliveredCount,
                           double totalDistance,
                           double bestFitness,
                           int bestGeneration) {
        this.assignments = assignments;
        this.undeliveredItemIds = undeliveredItemIds;
        this.deliveredCount = deliveredCount;
        this.totalDistance = totalDistance;
        this.bestFitness = bestFitness;
        this.bestGeneration = bestGeneration;
    }

    public static RoutingResponse fromSolverResult(GASolverResult result) {
        return new RoutingResponse(
                result.getAssignments(),
                result.getUndeliveredItemIds(),
                result.getDeliveredCount(),
                result.getTotalDistance(),
                result.getBestFitness(),
                result.getBestGeneration()
        );
    }

    public Map<String, RouteAssignment> getAssignments() {
        return assignments;
    }

    public List<Integer> getUndeliveredItemIds() {
        return undeliveredItemIds;
    }

    public int getDeliveredCount() {
        return deliveredCount;
    }

    public double getTotalDistance() {
        return totalDistance;
    }

    public double getBestFitness() {
        return bestFitness;
    }

    public int getBestGeneration() {
        return bestGeneration;
    }
}
