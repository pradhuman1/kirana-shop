const responseCode = {
  BUSINESS_ALREADY_EXISTS: 4001,
  BUSINESS_NOT_FOUND: 4002,
  SUCCESS: 2000, // generic success code for all api
  INVALID_AUTH: 4003,
  INVALID_OTP: 4004,
  INTERNAL_SERVER_ERROR: 5000,
  INVALID_REQUEST: 4005,
  OTP_GENERATION_FAILED: 4006,
  OTP_SEND_FAILED: 4007,
};

export const responseMessage = {
  BUSINESS_ALREADY_EXISTS: "Business already exists",
  BUSINESS_CREATED_SUCCESSFULLY: "Business created successfully",
  OTP_SENT_SUCCESSFULLY: "OTP sent successfully",
  INVALID_OTP: "OTP is not correct",
  INVALID_AUTH: "Invalid token,user not authorized",
  BUSINESS_LOGGED_IN_SUCCESSFULLY: "Business logged in successfully",
};

export default responseCode;
