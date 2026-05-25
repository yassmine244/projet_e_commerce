// Plain-text passwords; the User model's pre-save hook hashes on .create() / .save()
const users = [
  {
    name: 'Admin',
    email: 'admin@shop.com',
    password: 'admin123',
    isAdmin: true,
  },
  {
    name: 'Salma Bouzid',
    email: 'salma.bouzid@gmail.com',
    password: 'password123',
    isAdmin: false,
  },
  {
    name: 'Karim Trabelsi',
    email: 'karim.trabelsi@outlook.com',
    password: 'password123',
    isAdmin: false,
  },
  {
    name: 'Lucas Martin',
    email: 'lucas.martin@gmail.com',
    password: 'password123',
    isAdmin: false,
  },
  {
    name: 'Yasmine Mansouri',
    email: 'yasmine.mansouri@gmail.com',
    password: 'password123',
    isAdmin: false,
  },
];

module.exports = users;
