const responseCode = {
  BUSINESS_ALREADY_EXISTS: 100,
  SUCCESS: 200, // generic success code for all api
  INVALID_OTP: 600,
};

export const responseMessage = {
  BUSINESS_ALREADY_EXISTS: "Business already exists",
  BUSINESS_CREATED_SUCCESSFULLY: "Business created successfully",
  OTP_SENT_SUCCESSFULLY: "OTP sent successfully",
  INVALID_OTP: "OTP is not correct",
};

export default responseCode;
