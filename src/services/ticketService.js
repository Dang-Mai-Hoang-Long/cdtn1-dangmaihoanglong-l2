export default class TicketService {
  constructor(ticketRepository) {
    this.ticketRepository = ticketRepository;
  }

  listTickets() {
    return this.ticketRepository.list();
  }
}
