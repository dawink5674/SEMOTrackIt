export default class Route {
  constructor(id, stops, schedule) {
    this.id = id;
    this.stops = stops; // array of stop IDs
    this.schedule = schedule; // schedule object
  }
}
