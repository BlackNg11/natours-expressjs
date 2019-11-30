const express = require('express');
const tourController = require('./../controller/tourController');
const authController = require('./../controller/authController');
//const reviewController = require('./../controller/reviewController');
const reviewRouter = require('./reviewRoute');

const router = express.Router();

//router.param('id', tourController.checkID);

// Create a checkBody middleware
// Check if body contains the name and price property
// If not,send 404
// Add it to the post handler stack
router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours)

router
    .route('/tour-start')
    .get(tourController.getTourStats);

router
    .route('/monthly-plan/:year')
    .get(authController.protect, authController.restrictTo('guide'), tourController.getMonthlyPlan);

router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);

router
    .route('/distances/:latlng/unit/:unit')
    .get(tourController.getDistances)

router
    .route('/')
    .get(tourController.getAllTours)
    .post(/*tourController.checkBody,*/ authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour)
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);

//POST /tour/idTour/review
/*router
    .route('/:tourId/reviews')
    .post(authController.protect, authController.restrictTo('user'), reviewController.creatReview);*/

router.use('/:tourId/reviews', reviewRouter);

module.exports = router;