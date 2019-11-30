const stripe = require('stripe')(process.env.STRIPE_SECTRET_KEY);
const Tour = require('./../models/tourModel');
const Booking = require('./../models/BookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appErr');
const factory = require('./hanlerFatory');

exports.getCheckOutSession = catchAsync(async (req, res, next) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId)

    // 2) Create checkout seassion
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imagesCover}`],
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    })

    // 3) Create seassion as response
    res.status(200).json({
        status: 'success',
        session
    })
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    // This is only TEMPORARY,beacause it's UNSECURE: eveyone can make booking without paying
    const { tour, user, price } = req.query;

    if (!tour || !user || !price) return next();

    await Booking.create({ tour, user, price });

    res.redirect(req.originalUrl.split('?')[0]);

});


exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);