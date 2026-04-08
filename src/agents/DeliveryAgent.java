package agents;

import jade.core.AID;
import jade.core.Agent;
import jade.core.behaviours.CyclicBehaviour;
import jade.core.behaviours.OneShotBehaviour;
import jade.lang.acl.ACLMessage;
import jade.lang.acl.MessageTemplate;

public class DeliveryAgent extends Agent {

    @Override
    protected void setup() {
        System.out.println(getLocalName() + " started.");

        Object[] args = getArguments();

        String vehicleId = getLocalName();
        int capacity = 3;
        double maxDistance = 100.0;
        String mraName = "mra";

        if (args != null && args.length >= 3) {
            capacity = Integer.parseInt(args[0].toString());
            maxDistance = Double.parseDouble(args[1].toString());
            mraName = args[2].toString();
        }

        final String finalVehicleId = vehicleId;
        final int finalCapacity = capacity;
        final double finalMaxDistance = maxDistance;
        final String finalMraName = mraName;

        addBehaviour(new OneShotBehaviour() {
            @Override
            public void action() {
                ACLMessage msg = new ACLMessage(ACLMessage.INFORM);
                msg.addReceiver(new AID(finalMraName, AID.ISLOCALNAME));
                msg.setConversationId("register-capacity");
                msg.setContent("vehicleId=" + finalVehicleId
                        + ";capacity=" + finalCapacity
                        + ";maxDistance=" + finalMaxDistance);

                send(msg);

                System.out.println(getLocalName() + " sent capacity to " + finalMraName);
            }
        });

        addBehaviour(new CyclicBehaviour() {
            @Override
            public void action() {
                MessageTemplate mt = MessageTemplate.and(
                        MessageTemplate.MatchPerformative(ACLMessage.INFORM),
                        MessageTemplate.MatchConversationId("route-assignment")
                );

                ACLMessage msg = receive(mt);

                if (msg != null) {
                    System.out.println(getLocalName() + " received route assignment:");
                    System.out.println(msg.getContent());

                    ACLMessage ack = new ACLMessage(ACLMessage.CONFIRM);
                    ack.addReceiver(new AID(finalMraName, AID.ISLOCALNAME));
                    ack.setConversationId("route-ack");
                    ack.setContent("vehicleId=" + finalVehicleId + ";status=RECEIVED");
                    send(ack);

                    System.out.println(getLocalName() + " sent route acknowledgement.");
                } else {
                    block();
                }
            }
        });
    }
}
