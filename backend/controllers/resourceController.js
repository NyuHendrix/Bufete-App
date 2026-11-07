export function createCrudController(model, options = {}) {
  const { resourceName = 'registro' } = options

  return {
    async list(request, response, next) {
      try {
        const items = await model.list()
        response.status(200).json(items)
      } catch (error) {
        next(error)
      }
    },

    async getById(request, response, next) {
      try {
        const item = await model.getById(request.params.id)
        if (!item) {
          response.status(404).json({ message: `${resourceName} no encontrado` })
          return
        }
        response.status(200).json(item)
      } catch (error) {
        next(error)
      }
    },

    async create(request, response, next) {
      try {
        const item = await model.create(request.body)
        response.status(201).json(item)
      } catch (error) {
        next(error)
      }
    },

    async update(request, response, next) {
      try {
        const item = await model.update(request.params.id, request.body)
        if (!item) {
          response.status(404).json({ message: `${resourceName} no encontrado` })
          return
        }
        response.status(200).json(item)
      } catch (error) {
        next(error)
      }
    },

    async remove(request, response, next) {
      try {
        const item = await model.remove(request.params.id)
        response.status(200).json({ message: `${resourceName} eliminado`, item })
      } catch (error) {
        next(error)
      }
    },
  }
}
