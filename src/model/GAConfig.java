package model;

public class GAConfig {
    private final int populationSize;
    private final int generations;
    private final int tournamentSize;
    private final int eliteSize;
    private final double crossoverRate;
    private final double mutationRate;

    public GAConfig(int populationSize,
                    int generations,
                    int tournamentSize,
                    double crossoverRate,
                    double mutationRate) {
        this(populationSize, generations, tournamentSize, 1, crossoverRate, mutationRate);
    }

    public GAConfig(int populationSize,
                    int generations,
                    int tournamentSize,
                    int eliteSize,
                    double crossoverRate,
                    double mutationRate) {
        this.populationSize = populationSize;
        this.generations = generations;
        this.tournamentSize = tournamentSize;
        this.eliteSize = eliteSize;
        this.crossoverRate = crossoverRate;
        this.mutationRate = mutationRate;
    }

    public static GAConfig defaultConfig() {
        return new GAConfig(40, 100, 3, 0.8, 0.2);
    }

    public int getPopulationSize() {
        return populationSize;
    }

    public int getGenerations() {
        return generations;
    }

    public int getTournamentSize() {
        return tournamentSize;
    }

    public int getEliteSize() {
        return eliteSize;
    }

    public double getCrossoverRate() {
        return crossoverRate;
    }

    public double getMutationRate() {
        return mutationRate;
    }
}
