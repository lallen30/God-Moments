# API Endpoints Documentation

Base URL: `https://godmoments.betaplanets.com/api`

## Authentication
- `wp-json/jwt-auth/v1/token` (LOGIN)
  - Purpose: User authentication and login
  - Method: POST

## User Management
- `wp-json/mobileapi/v1/getProfile` (GET_PROFILE)
  - Purpose: Retrieve user profile information
  - Method: POST

- `wp-json/mobileapi/v1/updateProfile` (UPDATE_PROFILE)
  - Purpose: Update user profile information
  - Method: POST

- `updatePassword` (CHANGE_PASSWORD)
  - Purpose: Change user password
  - Method: POST

- `delete_user` (DELETE_USER)
  - Purpose: Delete user account
  - Method: POST

## Password Recovery
- `/custom/v1/forgotPassword`
  - Purpose: Initiate password recovery process
  - Method: POST

- `/custom/v1/checkOtp`
  - Purpose: Verify OTP for password recovery
  - Method: POST

- `/custom/v1/updatePassword`
  - Purpose: Reset password after verification
  - Method: POST

## Registration
- `/v1/register`
  - Purpose: Register new user
  - Method: POST

- `verifyemail_and_send_otp`
  - Purpose: Verify email and send OTP during registration
  - Method: POST

## Calendar
- `wp-json/mobileapi/v1/getEvents` (GET_EVENTS)
  - Purpose: Retrieve calendar events
  - Method: GET

## AI Features
- `get_ai_api_url` (GET_AI_API_URL)
  - Purpose: Get AI API URL
  - Method: GET

- `get_ai_welcome` (GET_AI_WELCOME)
  - Purpose: Get AI welcome message
  - Method: GET

- `save_ai_qna` (SAVE_AI_QNA)
  - Purpose: Save AI questions and answers
  - Method: POST

- `ask_bluestoneai` (ASK_BLUESTONEAI)
  - Purpose: Submit questions to BluestoneAI
  - Method: POST

- `get_ai_credentials` (GET_AI_CREDENTIALS)
  - Purpose: Get AI service credentials
  - Method: GET

## Content
- `get_aboutus` (GET_ABOUTUS)
  - Purpose: Retrieve about us content
  - Method: GET

## Legal
- `wp-json/mobileapi/v1/getTermsPublishedDate` (GET_TERMS_DATE)
  - Purpose: Get terms and conditions last published date
  - Method: GET

- `wp-json/mobileapi/v1/getPrivacyPublishedDate` (GET_PRIVACY_DATE)
  - Purpose: Get privacy policy last published date
  - Method: GET

- `wp-json/mobileapi/v1/getTermsPage` (GET_TERMS_PAGE)
  - Purpose: Get terms and conditions content
  - Method: GET

- `wp-json/mobileapi/v1/getPrivacyPage` (GET_PRIVACY_PAGE)
  - Purpose: Get privacy policy content
  - Method: GET

## App Version
- `wp-json/mobileapi/v1/app_version` (APP_VERSION)
  - Purpose: Get current app version information
  - Method: GET

## Contact
- `/contact_us`
  - Purpose: Submit contact form
  - Method: POST
