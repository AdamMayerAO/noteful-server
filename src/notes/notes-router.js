const express = require('express')
const path = require('path')
//const { isWebUri } = require('valid-url')
const xss = require('xss')
//const logger = require('../logger')
const notesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

const serializeNote = note => ({
  id: note.id,
  title: xss(note.title),
  contents: xss(note.contents),
  folder: Number(note.folder),
  modified: note.date,
})

notesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    notesService.getAllNotes(knexInstance)
      .then(notes => {
        res.json(notes.map(serializeNote))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { title, contents, folder } = req.body
    const newNote = { title, contents, folder}
    for (const [key, value] of Object.entries(newNote)) {
        if (value == null) {
          return res.status(400).json({
            error: { message: `Missing '${key}' in request body` }
          })
        }
      }


    

    notesService.addNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
//        logger.info(`Note with id ${note.id} created.`)
        res
          .status(201)
          .location(`/notes/${note.id}`)
          .json(serializeNote(note))
      })
      .catch(next)
  })

notesRouter
  .route('/:note_id')
  .all((req, res, next) => {
    const { note_id } = req.params.note_id
   notesService.getById(req.app.get('db'), note_id)
      .then(note => {
        if (!note) {
         // logger.error(`Note with id ${note_id} not found.`)
          return res.status(404).json({
            error: { message: `Note Not Found` }
          })
        }
        res.note = note
        next()
      })
      .catch(next)

  })
  .get((req, res) => {
    res.json(serializeNote(res.note))
  })
  .delete((req, res, next) => {
    const { note_id } = req.params.note_id
    notesService.deleteNote(
      req.app.get('db'),
      note_id
    )
      .then(numRowsAffected => {
       // logger.info(`Note with id ${note_id} deleted.`)
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = notesRouter
