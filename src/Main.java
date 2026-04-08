import jade.core.Profile;
import jade.core.ProfileImpl;
import jade.core.Runtime;
import jade.wrapper.AgentContainer;
import jade.wrapper.AgentController;

public class Main {
    public static void main(String[] args) {
        try {
            Runtime runtime = Runtime.instance();
            String itemsFilePath = args.length >= 1 ? args[0] : "data/items.txt";

            Profile profile = new ProfileImpl();
            profile.setParameter(Profile.GUI, "true");

            AgentContainer mainContainer = runtime.createMainContainer(profile);

            AgentController mra = mainContainer.createNewAgent(
                    "mra",
                    "agents.MasterRoutingAgent",
                    new Object[]{"2", itemsFilePath}
            );
            mra.start();

            AgentController da1 = mainContainer.createNewAgent(
                    "da1",
                    "agents.DeliveryAgent",
                    new Object[]{"3", "100.0", "mra"}
            );
            da1.start();

            AgentController da2 = mainContainer.createNewAgent(
                    "da2",
                    "agents.DeliveryAgent",
                    new Object[]{"4", "120.0", "mra"}
            );
            da2.start();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
