package optimizer;

import model.DeliveryItem;
import model.GAConfig;
import model.GASolverResult;
import model.RouteAssignment;
import model.VehicleInfo;
import model.Warehouse;
import util.DistanceCalculator;
import util.RouteTimeEvaluator;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

public class GASolver {

    private static final double BIG_CONSTANT = 1_000_000.0;
    private static final Comparator<ScoredSolution> SOLUTION_COMPARATOR =
            Comparator.comparingInt(ScoredSolution::getDeliveredCount)
                    .thenComparing(Comparator.comparingDouble(ScoredSolution::getTotalDistance).reversed())
                    .reversed();

    private final Random random = new Random();

    private final int populationSize;
    private final int generations;
    private final int tournamentSize;
    private final int eliteSize;
    private final double crossoverRate;
    private final double mutationRate;
    private final Warehouse warehouse;

    public GASolver() {
        this(GAConfig.defaultConfig(), Warehouse.defaultWarehouse());
    }

    public GASolver(GAConfig config) {
        this(config, Warehouse.defaultWarehouse());
    }

    public GASolver(GAConfig config, Warehouse warehouse) {
        this.populationSize = config.getPopulationSize();
        this.generations = config.getGenerations();
        this.tournamentSize = config.getTournamentSize();
        this.eliteSize = Math.max(1, Math.min(config.getEliteSize(), this.populationSize));
        this.crossoverRate = config.getCrossoverRate();
        this.mutationRate = config.getMutationRate();
        this.warehouse = warehouse;
    }

    public GASolverResult solve(List<DeliveryItem> items, List<VehicleInfo> vehicles) {
        if (items == null || items.isEmpty() || vehicles == null || vehicles.isEmpty()) {
            return new GASolverResult(new HashMap<String, RouteAssignment>(),
                    new ArrayList<Integer>(),
                    0,
                    0.0,
                    0.0,
                    0);
        }

        List<int[]> population = initializePopulation(items.size());
        ScoredSolution bestOverall = null;
        int bestGeneration = 0;

        for (int generation = 0; generation < generations; generation++) {
            List<ScoredSolution> scoredPopulation = evaluatePopulation(population, items, vehicles);
            scoredPopulation.sort(SOLUTION_COMPARATOR);
            ScoredSolution bestInGeneration = scoredPopulation.get(0);

            if (bestOverall == null || SOLUTION_COMPARATOR.compare(bestInGeneration, bestOverall) < 0) {
                bestOverall = bestInGeneration;
                bestGeneration = generation;
            }

            logGeneration(generation, bestInGeneration);

            List<int[]> nextPopulation = new ArrayList<>();
            int eliteCount = Math.min(eliteSize, scoredPopulation.size());
            for (int i = 0; i < eliteCount; i++) {
                nextPopulation.add(scoredPopulation.get(i).copyChromosome());
            }

            while (nextPopulation.size() < populationSize) {
                int[] parent1 = tournamentSelect(scoredPopulation);
                int[] parent2 = tournamentSelect(scoredPopulation);

                int[] child;
                if (random.nextDouble() < crossoverRate) {
                    child = orderCrossover(parent1, parent2);
                } else {
                    child = Arrays.copyOf(parent1, parent1.length);
                }

                if (random.nextDouble() < mutationRate) {
                    swapMutation(child);
                }

                nextPopulation.add(child);
            }

            population = nextPopulation;
        }

        logBestOverall(bestOverall, bestGeneration);
        DecodeResult bestDecode = bestOverall.getDecodeResult();
        return new GASolverResult(
                bestDecode.assignments,
                bestDecode.undeliveredItemIds,
                bestDecode.deliveredCount,
                bestDecode.totalDistance,
                bestOverall.getFitness(),
                bestGeneration
        );
    }

    private List<int[]> initializePopulation(int itemCount) {
        List<int[]> population = new ArrayList<>();

        for (int i = 0; i < populationSize; i++) {
            List<Integer> genes = new ArrayList<>();
            for (int gene = 0; gene < itemCount; gene++) {
                genes.add(gene);
            }
            Collections.shuffle(genes, random);

            int[] chromosome = new int[itemCount];
            for (int j = 0; j < itemCount; j++) {
                chromosome[j] = genes.get(j);
            }
            population.add(chromosome);
        }

        return population;
    }

    private List<ScoredSolution> evaluatePopulation(List<int[]> population,
                                                    List<DeliveryItem> items,
                                                    List<VehicleInfo> vehicles) {
        List<ScoredSolution> scored = new ArrayList<>();

        for (int[] chromosome : population) {
            DecodeResult decodeResult = decode(chromosome, items, vehicles);
            validateDecodeResult(decodeResult, items, vehicles);
            double fitness = decodeResult.deliveredCount * BIG_CONSTANT - decodeResult.totalDistance;
            scored.add(new ScoredSolution(chromosome, fitness, decodeResult));
        }

        return scored;
    }

    private void logGeneration(int generation, ScoredSolution bestInGeneration) {
        if (generation == 0 || generation == generations - 1 || generation % 10 == 0) {
            System.out.println(
                    "[GA] Generation " + generation
                            + " | delivered=" + bestInGeneration.getDeliveredCount()
                            + " | distance=" + bestInGeneration.getTotalDistance()
                            + " | fitness=" + bestInGeneration.getFitness()
            );
        }
    }

    private void logBestOverall(ScoredSolution bestOverall, int bestGeneration) {
        if (bestOverall == null) {
            return;
        }

        System.out.println(
                "[GA] Best overall at generation " + bestGeneration
                        + " | delivered=" + bestOverall.getDeliveredCount()
                        + " | distance=" + bestOverall.getTotalDistance()
                        + " | fitness=" + bestOverall.getFitness()
        );
    }

    private DecodeResult decode(int[] chromosome, List<DeliveryItem> items, List<VehicleInfo> vehicles) {
        Map<String, List<Integer>> vehicleItemIds = new HashMap<>();
        Map<String, List<DeliveryItem>> vehicleItems = new HashMap<>();
        List<Integer> undelivered = new ArrayList<>();

        for (VehicleInfo vehicle : vehicles) {
            vehicleItemIds.put(vehicle.getVehicleId(), new ArrayList<Integer>());
            vehicleItems.put(vehicle.getVehicleId(), new ArrayList<DeliveryItem>());
        }

        int vehicleIndex = 0;

        for (int gene : chromosome) {
            DeliveryItem candidateItem = items.get(gene);
            boolean assigned = false;
            int attempts = 0;

            while (attempts < vehicles.size() && !assigned) {
                VehicleInfo vehicle = vehicles.get(vehicleIndex % vehicles.size());
                List<DeliveryItem> currentItems = vehicleItems.get(vehicle.getVehicleId());

                if (currentItems.size() < vehicle.getCapacity()) {
                    List<DeliveryItem> trialRoute = new ArrayList<>(currentItems);
                    trialRoute.add(candidateItem);
                    double trialDistance = calculateRouteDistance(trialRoute);
                    boolean timeFeasible = RouteTimeEvaluator.evaluate(warehouse, trialRoute).isFeasible();

                    if (trialDistance <= vehicle.getMaxDistance() && timeFeasible) {
                        currentItems.add(candidateItem);
                        vehicleItemIds.get(vehicle.getVehicleId()).add(candidateItem.getId());
                        assigned = true;
                    }
                }

                if (!assigned) {
                    vehicleIndex++;
                    attempts++;
                }
            }

            if (!assigned) {
                undelivered.add(candidateItem.getId());
            } else {
                vehicleIndex++;
            }
        }

        Map<String, RouteAssignment> assignments = new HashMap<>();
        int deliveredCount = 0;
        double totalDistance = 0.0;

        for (VehicleInfo vehicle : vehicles) {
            List<Integer> itemIds = vehicleItemIds.get(vehicle.getVehicleId());
            List<DeliveryItem> routeItems = vehicleItems.get(vehicle.getVehicleId());
            double routeDistance = calculateRouteDistance(routeItems);

            deliveredCount += itemIds.size();
            totalDistance += routeDistance;

            assignments.put(
                    vehicle.getVehicleId(),
                    new RouteAssignment(vehicle.getVehicleId(), itemIds, routeDistance)
            );
        }

        return new DecodeResult(assignments, undelivered, deliveredCount, totalDistance);
    }

    private void validateDecodeResult(DecodeResult result,
                                      List<DeliveryItem> items,
                                      List<VehicleInfo> vehicles) {
        Set<Integer> assignedIds = new HashSet<>();
        Set<Integer> undeliveredIds = new HashSet<>(result.undeliveredItemIds);

        if (undeliveredIds.size() != result.undeliveredItemIds.size()) {
            throw new IllegalStateException("Duplicate item detected in undelivered list.");
        }

        int countedDelivered = 0;
        double countedTotalDistance = 0.0;

        for (VehicleInfo vehicle : vehicles) {
            RouteAssignment assignment = result.assignments.get(vehicle.getVehicleId());

            if (assignment == null) {
                throw new IllegalStateException("Missing assignment for vehicle: " + vehicle.getVehicleId());
            }

            if (assignment.getItemIds().size() > vehicle.getCapacity()) {
                throw new IllegalStateException(
                        "Capacity violation for vehicle " + vehicle.getVehicleId()
                                + ": " + assignment.getItemIds().size() + " > " + vehicle.getCapacity()
                );
            }

            if (assignment.getTotalDistance() > vehicle.getMaxDistance() + 1e-9) {
                throw new IllegalStateException(
                        "Max distance violation for vehicle " + vehicle.getVehicleId()
                                + ": " + assignment.getTotalDistance() + " > " + vehicle.getMaxDistance()
                );
            }

            List<DeliveryItem> assignedRouteItems = new ArrayList<>();
            for (Integer itemId : assignment.getItemIds()) {
                DeliveryItem matchedItem = findItemById(items, itemId);
                if (matchedItem == null) {
                    throw new IllegalStateException("Assigned item not found in master item list: " + itemId);
                }
                assignedRouteItems.add(matchedItem);
            }

            RouteTimeEvaluator.RouteTimeResult timeResult =
                    RouteTimeEvaluator.evaluate(warehouse, assignedRouteItems);
            if (!timeResult.isFeasible()) {
                throw new IllegalStateException(
                        "Time window violation for vehicle " + vehicle.getVehicleId()
                                + " on assigned route " + assignment.getItemIds()
                );
            }

            for (Integer itemId : assignment.getItemIds()) {
                if (undeliveredIds.contains(itemId)) {
                    throw new IllegalStateException("Item " + itemId + " appears in both assigned and undelivered.");
                }
                if (!assignedIds.add(itemId)) {
                    throw new IllegalStateException("Duplicate assigned item detected: " + itemId);
                }
            }

            countedDelivered += assignment.getItemIds().size();
            countedTotalDistance += assignment.getTotalDistance();
        }

        int totalTrackedItems = assignedIds.size() + undeliveredIds.size();
        if (totalTrackedItems != items.size()) {
            throw new IllegalStateException(
                    "Tracked item count mismatch. assigned + undelivered = "
                            + totalTrackedItems + ", expected " + items.size()
            );
        }

        if (countedDelivered != result.deliveredCount) {
            throw new IllegalStateException(
                    "Delivered count mismatch. Counted = " + countedDelivered
                            + ", result = " + result.deliveredCount
            );
        }

        if (Math.abs(countedTotalDistance - result.totalDistance) > 1e-9) {
            throw new IllegalStateException(
                    "Total distance mismatch. Counted = " + countedTotalDistance
                            + ", result = " + result.totalDistance
            );
        }
    }

    private DeliveryItem findItemById(List<DeliveryItem> items, int itemId) {
        for (DeliveryItem item : items) {
            if (item.getId() == itemId) {
                return item;
            }
        }
        return null;
    }

    private double calculateRouteDistance(List<DeliveryItem> routeItems) {
        if (routeItems.isEmpty()) {
            return 0.0;
        }

        double distance = DistanceCalculator.fromWarehouse(warehouse, routeItems.get(0));

        for (int i = 1; i < routeItems.size(); i++) {
            distance += DistanceCalculator.between(routeItems.get(i - 1), routeItems.get(i));
        }

        distance += DistanceCalculator.backToWarehouse(routeItems.get(routeItems.size() - 1), warehouse);
        return distance;
    }

    private int[] tournamentSelect(List<ScoredSolution> scoredPopulation) {
        ScoredSolution best = null;

        for (int i = 0; i < tournamentSize; i++) {
            ScoredSolution candidate = scoredPopulation.get(random.nextInt(scoredPopulation.size()));
            if (best == null || SOLUTION_COMPARATOR.compare(candidate, best) < 0) {
                best = candidate;
            }
        }

        return best.copyChromosome();
    }

    private int[] orderCrossover(int[] parent1, int[] parent2) {
        int size = parent1.length;
        int[] child = new int[size];
        Arrays.fill(child, -1);

        int start = random.nextInt(size);
        int end = random.nextInt(size);

        if (start > end) {
            int temp = start;
            start = end;
            end = temp;
        }

        for (int i = start; i <= end; i++) {
            child[i] = parent1[i];
        }

        int childIndex = (end + 1) % size;
        int parentIndex = (end + 1) % size;

        while (containsEmptyGene(child)) {
            int gene = parent2[parentIndex];
            if (!containsGene(child, gene)) {
                child[childIndex] = gene;
                childIndex = (childIndex + 1) % size;
            }
            parentIndex = (parentIndex + 1) % size;
        }

        return child;
    }

    private void swapMutation(int[] chromosome) {
        if (chromosome.length < 2) {
            return;
        }

        int index1 = random.nextInt(chromosome.length);
        int index2 = random.nextInt(chromosome.length);

        int temp = chromosome[index1];
        chromosome[index1] = chromosome[index2];
        chromosome[index2] = temp;
    }

    private boolean containsGene(int[] chromosome, int gene) {
        for (int value : chromosome) {
            if (value == gene) {
                return true;
            }
        }
        return false;
    }

    private boolean containsEmptyGene(int[] chromosome) {
        for (int value : chromosome) {
            if (value == -1) {
                return true;
            }
        }
        return false;
    }

    private static class DecodeResult {
        private final Map<String, RouteAssignment> assignments;
        private final List<Integer> undeliveredItemIds;
        private final int deliveredCount;
        private final double totalDistance;

        private DecodeResult(Map<String, RouteAssignment> assignments,
                             List<Integer> undeliveredItemIds,
                             int deliveredCount,
                             double totalDistance) {
            this.assignments = assignments;
            this.undeliveredItemIds = undeliveredItemIds;
            this.deliveredCount = deliveredCount;
            this.totalDistance = totalDistance;
        }
    }

    private static class ScoredSolution {
        private final int[] chromosome;
        private final double fitness;
        private final DecodeResult decodeResult;

        private ScoredSolution(int[] chromosome, double fitness, DecodeResult decodeResult) {
            this.chromosome = Arrays.copyOf(chromosome, chromosome.length);
            this.fitness = fitness;
            this.decodeResult = decodeResult;
        }

        private double getFitness() {
            return fitness;
        }

        private int getDeliveredCount() {
            return decodeResult.deliveredCount;
        }

        private double getTotalDistance() {
            return decodeResult.totalDistance;
        }

        private DecodeResult getDecodeResult() {
            return decodeResult;
        }

        private int[] copyChromosome() {
            return Arrays.copyOf(chromosome, chromosome.length);
        }
    }
}
