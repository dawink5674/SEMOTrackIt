export default class Stop {
  constructor(id, name, location, ETA) {
    this.id = id;
    this.name = name;
    this.location = location; // {latitude, longitude}
    this.ETA = ETA; // estimated arrival time
  }
}
