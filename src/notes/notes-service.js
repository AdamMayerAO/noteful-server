const notesService = {
    getAllNotes(knex) {
      return knex.select('*').from('noteful_notes')
    },
    getById(knex, id) {
      return knex.from('noteful_notes').select('*').where('id', id).first()
    },
    getByFolder(knex, folderId){
        return knex.from('noteful_notes').select('*').where('noteful_folder', folderId).first()
    },

    addNote(knex, newNote) {
      return knex
        .insert(newNote)
        .into('noteful_notes')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
    deleteNote(knex, id) {
      return knex('noteful_notes')
        .where({ id })
        .delete()
    },
  }
  
  module.exports = notesService
  