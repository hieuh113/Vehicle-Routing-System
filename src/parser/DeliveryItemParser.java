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

            while ((line = reader.readLine()) != null) {
                line = line.trim();

                if (line.isEmpty()) {
                    continue;
                }

                String[] parts = line.split(",");

                int id = Integer.parseInt(parts[0].trim());
                double x = Double.parseDouble(parts[1].trim());
                double y = Double.parseDouble(parts[2].trim());

                items.add(new DeliveryItem(id, x, y));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return items;
    }
}
