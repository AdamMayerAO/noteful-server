const express = require('express')
//const { isWebUri } = require('valid-url')
const xss = require('xss')
//const logger = require('../logger')
const foldersService = require('./folders-service')

const foldersRouter = express.Router()
const jsonParser = express.json()

const serializeFolder = folder => ({
  id: folder.id,
  title: xss(folder.title),
  modified: folder.date_published,
})
foldersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    foldersService.getAllFolders(knexInstance)
      .then(folders => {
        res.json(folders.map(serializeFolder))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { title } = req.body
    const newFolder = {title}

    for (const field of ['title']) {
      if (!req.body[field]) {
        //logger.error(`${field} is required`)
        return res.status(400).send(`'${field}' is required`)
      }
    }

    
    foldersService.addFolder(
      req.app.get('db'),
      newFolder
    )
      .then(folder => {
        //logger.info(`folder with id ${folder.id} created.`)
        res
          .status(201)
          .location(`/folders/${folder.id}`)
          .json(serializeFolder(folder))
      })
      .catch(next)
  })

foldersRouter
  .route('/:folder_id')
  .all((req, res, next) => {
    const { folder_id } = req.params
    console.log(req.params)
   foldersService.getById(req.app.get('db'), folder_id)
      .then(folder => {
        if (!folder) {
          //logger.error(`folder with id ${folder_id} not found.`)
          return res.status(404).json({
            error: { message: `Folder Not Found` }
          })
        }
        res.folder = folder
        next()
      })
      .catch(next)
  })
  .get((req, res) => {
    res.json(serializeFolder(res.folder))
  })
  .delete((req, res, next) => {
    const { folder_id } = req.params
    foldersService.deleteFolder(
      req.app.get('db'),
      folder_id
    )
      .then(numRowsAffected => {
     //   logger.info(`folder with id ${folder_id} deleted.`)
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = foldersRouter
