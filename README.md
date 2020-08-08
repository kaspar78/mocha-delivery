# Mocha Delivery System

This is a project I wrote for ordering mochas! It runs a webserver that listens for SMS messages to specified Twilio number. It then uses that information to respond (with a Haiku or otherwise).

## To Run:

1. Clone the repo
2. Run `node server.js`
3. Either make Postman requests to http://localhost:8686 or configure a Twilio number to accept this code as a webhook endpoint
3 (cont). Requests should be to whatever the endpoint is specified to in Twilio, or a POST to http://localhost:8686/sms.
4. Send some messages!
