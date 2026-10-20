import { Router } from "express";

export default function createTicketRoutes(ticketService) {
  const router = Router();

  router.get("/", async (_request, response) => {
    const tickets = await ticketService.listTickets();
    response.json({ data: tickets });
  });

  return router;
}
