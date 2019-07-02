
exports.up = async function(knex, Promise) {
  await knex.schema.hasTable('users');
  return await knex.schema.createTable('users', table => {
    table.string('email')
    table.string('username').unique()
    table.string('password')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
