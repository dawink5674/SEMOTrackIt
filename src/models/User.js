export default class User {
  constructor(id, name, role, preferences) {
    this.id = id;
    this.name = name;
    this.role = role; // e.g., 'student', 'faculty', 'staff'
    this.preferences = preferences; // object of preferences
  }
}
