const exprees = require('express');
const reviewController = require('./../controller/reviewController');
const authController = require('./../controller/authController');

const router = exprees.Router({
    mergeParams: true
});

//POST /tour/idTour/review
//POST /review
router.use(authController.protect);

router
    .route('/')
    .get(reviewController.getAllReview)
    .post(authController.restrictTo('user'), reviewController.setTourUserIds, reviewController.creatReview);

router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
    .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview);

module.exports = router;