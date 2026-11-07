import { Router } from 'express'
import { createCrudController } from '../controllers/resourceController.js'
import { clientModel } from '../models/clientModel.js'
import { appointmentModel } from '../models/appointmentModel.js'
import { paymentModel } from '../models/paymentModel.js'
import { expenseModel } from '../models/expenseModel.js'
import { caseModel } from '../models/caseModel.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { requireCsrf } from '../middleware/csrf.js'
import { clientValidator, appointmentValidator, paymentValidator } from '../validators/resourceValidator.js'

const router = Router()

const clientsController = createCrudController(clientModel, { resourceName: 'Cliente' })
const appointmentsController = createCrudController(appointmentModel, { resourceName: 'Cita' })
const paymentsController = createCrudController(paymentModel, { resourceName: 'Pago' })
const expensesController = createCrudController(expenseModel, { resourceName: 'Gasto' })
const casesController = createCrudController(caseModel, { resourceName: 'Caso' })

router.get('/health', (request, response) => response.status(200).json({ status: 'ok' }))
router.get('/admin/summary', requireAuth, requireRole('admin'), async (request, response) => {
  response.status(200).json({ ok: true, user: request.user })
})

router.get('/clients', clientsController.list)
router.get('/clients/:id', clientsController.getById)
router.post('/clients', clientValidator, clientsController.create)
router.put('/clients/:id', clientValidator, clientsController.update)
router.patch('/clients/:id', clientValidator, clientsController.update)
router.delete('/clients/:id', clientsController.remove)

router.get('/appointments', appointmentsController.list)
router.get('/appointments/:id', appointmentsController.getById)
router.post('/appointments', appointmentValidator, appointmentsController.create)
router.put('/appointments/:id', appointmentValidator, appointmentsController.update)
router.patch('/appointments/:id', appointmentValidator, appointmentsController.update)
router.delete('/appointments/:id', appointmentsController.remove)

router.get('/payments', paymentsController.list)
router.get('/payments/:id', paymentsController.getById)
router.post('/payments', paymentValidator, paymentsController.create)
router.put('/payments/:id', paymentValidator, paymentsController.update)
router.patch('/payments/:id', paymentValidator, paymentsController.update)
router.delete('/payments/:id', paymentsController.remove)

router.get('/expenses', expensesController.list)
router.get('/expenses/:id', expensesController.getById)
router.post('/expenses', expensesController.create)
router.put('/expenses/:id', expensesController.update)
router.patch('/expenses/:id', expensesController.update)
router.delete('/expenses/:id', expensesController.remove)

router.get('/cases', casesController.list)
router.get('/cases/:id', casesController.getById)
router.post('/cases', casesController.create)
router.put('/cases/:id', casesController.update)
router.patch('/cases/:id', casesController.update)
router.delete('/cases/:id', casesController.remove)

export default router
