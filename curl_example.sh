curl -v -k http://127.0.0.1:5000/alexa --data-binary  '{
  "version": "1.0",
  "session": {
    "new": true,
    "sessionId": "session1234",
    "application": {
      "applicationId": "amzn1.echo-sdk-ams.app.1234"
    },
    "attributes": {},
    "user": {
      "userId": null
    }
  },
  "request": {
    "type": "LaunchRequest",
    "requestId": "request5678",
    "timestamp": "2015-05-13T12:34:56Z"
  }
}'

