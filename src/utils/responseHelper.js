exports.successResponse = (res, message, data = {}) => {
    res.status(200).json({ status: 'Success', message, data });
};

exports.errorResponse = (res, message, statusCode = 500) => {
    res.status(statusCode).json({ status: 'Error', message });
};
