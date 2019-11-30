const exprees = require('express');
const bookingController = require('./../controller/bookingController');
const authController = require('./../controller/authController');

const router = exprees.Router();

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckOutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
    .route('/')
    .get(bookingController.getAllBooking)
    .post(bookingController.createBooking);

router
    .route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking);

module.exports = router; 