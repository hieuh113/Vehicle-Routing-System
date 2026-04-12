package parser;

import model.DeliveryItem;

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.List;

public class DeliveryItemParser {

    public List<DeliveryItem> parse(String filePath) {
        List<DeliveryItem> items = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;
            int lineNumber = 0;

            while ((line = reader.readLine()) != null) {
                lineNumber++;
                line = line.trim();

                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }

                String[] parts = line.split(",");
                if (parts.length != 3 && parts.length != 6) {
                    throw new IllegalArgumentException(
                            "Invalid item format at line " + lineNumber
                                    + ": expected 3 or 6 comma-separated values, got " + parts.length
                    );
                }

                try {
                    int id = Integer.parseInt(parts[0].trim());
                    double x = Double.parseDouble(parts[1].trim());
                    double y = Double.parseDouble(parts[2].trim());

                    if (parts.length == 3) {
                        items.add(new DeliveryItem(id, x, y));
                    } else {
                        double earliestTime = Double.parseDouble(parts[3].trim());
                        double latestTime = Double.parseDouble(parts[4].trim());
                        double serviceTime = Double.parseDouble(parts[5].trim());

                        if (latestTime < earliestTime) {
                            throw new IllegalArgumentException(
                                    "Invalid time window at line " + lineNumber
                                            + ": latestTime must be >= earliestTime"
                            );
                        }

                        if (serviceTime < 0) {
                            throw new IllegalArgumentException(
                                    "Invalid serviceTime at line " + lineNumber
                                            + ": serviceTime must be non-negative"
                            );
                        }

                        items.add(new DeliveryItem(id, x, y, earliestTime, latestTime, serviceTime));
                    }
                } catch (NumberFormatException e) {
                    throw new IllegalArgumentException(
                            "Invalid numeric value at line " + lineNumber + ": " + line,
                            e
                    );
                }
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to parse delivery items file: " + filePath, e);
        }

        return items;
    }
}
