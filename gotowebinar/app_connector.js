const {
  HttpUtils,
  HttpUtils: { request, successResponse, errorResponse },
} = require("quickwork-adapter-cli-server/http-library");
// const { triggers } = require("../google_calendar/app_connector");

const app = {
  name: "gotowebinar",
  alias: "gotowebinar",
  description: "Webinar Scheduling",
  version: "1",
  config: { authType: "oauth_2" },

  connection: {
    client_id: "",
    client_secret: "",
    redirect_uri: "https://proxy.quickwork.co.in/gotowebinar/code",
    
    authorization: {
      type: "oauth_2",
      authorization_url: async (connection) => {
        let scope = [
          "collab:webinars"
        ].join(" ");
        const url = `https://authentication.logmeininc.com/oauth/authorize?client_id=${app.connection.client_id}&response_type=code&redirect_uri=${app.connection.redirect_uri}&state=${connection.id}`;
        return { url };
      },

      acquire: async (code, scope, state) => {
        try {
          const tokenURL = "https://authentication.logmeininc.com/oauth/token";
          const body = new URLSearchParams({
            client_id: app.connection.client_id,
            client_secret: app.connection.client_secret,
            grant_type: "authorization_code",
            code,
            redirect_uri: app.connection.redirect_uri,
          }).toString();

          const encodedCredentials = Buffer.from(`${app.connection.client_id}:${app.connection.client_secret}`).toString('base64');

          const headers = {
            Authorization: `Basic ${encodedCredentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
          };

          const response = await request(
            tokenURL,
            headers,
            null,
            HttpUtils.HTTPMethods.POST,
            body,
            HttpUtils.ContentTypes.FORM_URL_ENCODED
          );

          if (response.success) {
            const jsonResponse = JSON.parse(response.body);
            return successResponse({
              accessToken: jsonResponse.access_token,
              refreshToken: jsonResponse.refresh_token,
              expires: jsonResponse.expires_in,
            });
          } else {
            return errorResponse(response.body, response.statusCode);
          }
        } catch (error) {
          return errorResponse(error.message);
        }
      },

      refresh: async (connection) => {
        try {
          const tokenURL = "https://api.getgo.com/oauth/v2/token";
          const body = new URLSearchParams({
            client_id: app.connection.client_id,
            client_secret: app.connection.client_secret,
            refresh_token: connection.oauthToken.refreshToken,
            grant_type: "refresh_token",
          }).toString();

          const encodedCredentials = Buffer.from(`${app.connection.client_id}:${app.connection.client_secret}`).toString('base64');

          const headers = {
            Authorization: `Basic ${encodedCredentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
          };

          const response = await request(
            tokenURL,
            headers,
            null,
            HttpUtils.HTTPMethods.POST,
            body,
            HttpUtils.ContentTypes.FORM_URL_ENCODED
          );

          if (response.success) {
            const jsonResponse = JSON.parse(response.body);
            return successResponse({
              accessToken: jsonResponse.access_token,
              expires: jsonResponse.expires_in,
            });
          } else {
            return errorResponse(response.body, response.statusCode);
          }
        } catch (error) {
          return errorResponse(error.message);
        }
      },
    },
  },

  actions: {
    get_webinar_details: {
      description: "Get Webinar Details",
      hint: "Retrieve the <b>details of a specific webinar</b> via <b>GoToWebinar</b>",
      
      input_fields: () => [
        {
          key: "organizerKey",
          name: "Organizer Key",
          hintText: "The unique key for the webinar organizer.",
          required: true,
          type: "string",
          controlType: "text",
        },
        {
          key: "webinarKey",
          name: "Webinar Key",
          hintText: "The unique key for the specific webinar.",
          required: true,
          type: "string",
          controlType: "text",
        },
      ],
    
      execute: async (connection, input) => {
        try {
          const url = `https://api.getgo.com/G2W/rest/v2/organizers/${input.organizerKey}/webinars/${input.webinarKey}`;
          const headers = {
            Authorization: `Bearer ${connection.oauthToken.accessToken}`,
            "Content-Type": "application/json",
          };

          const response = await request(
            url,
            headers,
            null,
            HttpUtils.HTTPMethods.GET
          );

          if (response.success) {
            return successResponse(response.body);
          } else {
            return errorResponse(response.body, response.statusCode);
          }
        } catch (error) {
          return errorResponse(error.message);
        }
      },

      output_fields: () => [
        {
          "key": "webinarKey",
          "name": "Webinar Key",
          "hintText": "Webinar Key",
          "helpText": "Webinar Key",
          "isExtendedSchema": false,
          "required": false,
          "type": "string",
          "controlType": "text"
        },
        {
          "key": "name",
          "name": "Name",
          "hintText": "Name",
          "helpText": "Name",
          "isExtendedSchema": false,
          "required": false,
          "type": "string",
          "controlType": "text"
        },
        {
          "key": "subject",
          "name": "Subject",
          "hintText": "Subject",
          "helpText": "Subject",
          "isExtendedSchema": false,
          "required": false,
          "type": "string",
          "controlType": "text"
        },
        {
          "key": "organizerKey",
          "name": "Organizer Key",
          "hintText": "Organizer Key",
          "helpText": "Organizer Key",
          "isExtendedSchema": false,
          "required": false,
          "type": "string",
          "controlType": "text"
        },
        {
          "key": "organizerEmail",
          "name": "Organizer Email",
          "hintText": "Organizer Email",
          "helpText": "Organizer Email",
          "isExtendedSchema": false,
          "required": false,
          "type": "string",
          "controlType": "text"
        },
        {
          "key": "organizerName",
          "name": "Organizer Name",
          "hintText": "Organizer Name",
          "helpText": "Organizer Name",
          "isExtendedSchema": false,
          "required": false,
          "type": "string",
          "controlType": "text"
        },
        {
          "key": "times",
          "name": "Times",
          "hintText": "Times",
          "helpText": "Times",
          "isExtendedSchema": false,
          "required": false,
          "type": "array",
          "controlType": "array",
          "as": "object",
          "properties": [
            {
              "key": "startTime",
              "name": "Start Time",
              "hintText": "Start Time",
              "helpText": "Start Time",
              "isExtendedSchema": false,
              "required": false,
              "type": "string",
              "controlType": "text"
            },
            {
              "key": "endTime",
              "name": "End Time",
              "hintText": "End Time",
              "helpText": "End Time",
              "isExtendedSchema": false,
              "required": false,
              "type": "string",
              "controlType": "text"
            }
          ]
        },
        {
          "key": "registrationUrl",
          "name": "Registration Url",
          "hintText": "Registration Url",
          "helpText": "Registration Url",
          "isExtendedSchema": false,
          "required": false,
          "type": "string",
          "controlType": "text"
        },
        {
          "key": "inSession",
          "name": "In Session",
          "hintText": "In Session",
          "helpText": "In Session",
          "isExtendedSchema": false,
          "required": false,
          "type": "boolean",
          "controlType": "select",
          "pickList": [
            [
              "Yes",
              true
            ],
            [
              "No",
              false
            ]
          ]
        },
        {
          "key": "impromptu",
          "name": "Impromptu",
          "hintText": "Impromptu",
          "helpText": "Impromptu",
          "isExtendedSchema": false,
          "required": false,
          "type": "boolean",
          "controlType": "select",
          "pickList": [
            [
              "Yes",
              true
            ],
            [
              "No",
              false
            ]
          ]
        },
        {
          "key": "type",
          "name": "Type",
          "hintText": "Type",
          "helpText": "Type",
          "isExtendedSchema": false,
          "required": false,
          "type": "string",
          "controlType": "text"
        },
        {
          "key": "timeZone",
          "name": "Time Zone",
          "hintText": "Time Zone",
          "helpText": "Time Zone",
          "isExtendedSchema": false,
          "required": false,
          "type": "string",
          "controlType": "text"
        },
        {
          "key": "locale",
          "name": "Locale",
          "hintText": "Locale",
          "helpText": "Locale",
          "isExtendedSchema": false,
          "required": false,
          "type": "string",
          "controlType": "text"
        },
        {
          "key": "replyTo",
          "name": "Reply To",
          "hintText": "Reply To",
          "helpText": "Reply To",
          "isExtendedSchema": false,
          "required": false,
          "type": "object",
          "controlType": "object",
          "properties": [
            {
              "key": "name",
              "name": "Name",
              "hintText": "Name",
              "helpText": "Name",
              "isExtendedSchema": false,
              "required": false,
              "type": "string",
              "controlType": "text"
            },
            {
              "key": "email",
              "name": "Email",
              "hintText": "Email",
              "helpText": "Email",
              "isExtendedSchema": false,
              "required": false,
              "type": "string",
              "controlType": "text"
            }
          ]
        },
        {
          "key": "accountKey",
          "name": "Account Key",
          "hintText": "Account Key",
          "helpText": "Account Key",
          "isExtendedSchema": false,
          "required": false,
          "type": "string",
          "controlType": "text"
        },
        {
          "key": "recurrencePeriod",
          "name": "Recurrence Period",
          "hintText": "Recurrence Period",
          "helpText": "Recurrence Period",
          "isExtendedSchema": false,
          "required": false,
          "type": "string",
          "controlType": "text"
        },
        {
          "key": "experienceType",
          "name": "Experience Type",
          "hintText": "Experience Type",
          "helpText": "Experience Type",
          "isExtendedSchema": false,
          "required": false,
          "type": "string",
          "controlType": "text"
        },
        {
          "key": "hasDisclaimer",
          "name": "Has Disclaimer",
          "hintText": "Has Disclaimer",
          "helpText": "Has Disclaimer",
          "isExtendedSchema": false,
          "required": false,
          "type": "boolean",
          "controlType": "select",
          "pickList": [
            [
              "Yes",
              true
            ],
            [
              "No",
              false
            ]
          ]
        },
        {
          "key": "isMainOrganizerActive",
          "name": "Is Main Organizer Active",
          "hintText": "Is Main Organizer Active",
          "helpText": "Is Main Organizer Active",
          "isExtendedSchema": false,
          "required": false,
          "type": "boolean",
          "controlType": "select",
          "pickList": [
            [
              "Yes",
              true
            ],
            [
              "No",
              false
            ]
          ]
        },
        {
          "key": "verifyHumanRegistrant",
          "name": "Verify Human Registrant",
          "hintText": "Verify Human Registrant",
          "helpText": "Verify Human Registrant",
          "isExtendedSchema": false,
          "required": false,
          "type": "boolean",
          "controlType": "select",
          "pickList": [
            [
              "Yes",
              true
            ],
            [
              "No",
              false
            ]
          ]
        },
        {
          "key": "breakoutsAllowed",
          "name": "Breakouts Allowed",
          "hintText": "Breakouts Allowed",
          "helpText": "Breakouts Allowed",
          "isExtendedSchema": false,
          "required": false,
          "type": "boolean",
          "controlType": "select",
          "pickList": [
            [
              "Yes",
              true
            ],
            [
              "No",
              false
            ]
          ]
        },
        {
          "key": "broadcast",
          "name": "Broadcast",
          "hintText": "Broadcast",
          "helpText": "Broadcast",
          "isExtendedSchema": false,
          "required": false,
          "type": "boolean",
          "controlType": "select",
          "pickList": [
            [
              "Yes",
              true
            ],
            [
              "No",
              false
            ]
          ]
        },
        {
          "key": "isPasswordProtected",
          "name": "Is Password Protected",
          "hintText": "Is Password Protected",
          "helpText": "Is Password Protected",
          "isExtendedSchema": false,
          "required": false,
          "type": "boolean",
          "controlType": "select",
          "pickList": [
            [
              "Yes",
              true
            ],
            [
              "No",
              false
            ]
          ]
        },
        {
          "key": "numberOfRegistrants",
          "name": "Number Of Registrants",
          "hintText": "Number Of Registrants",
          "helpText": "Number Of Registrants",
          "isExtendedSchema": false,
          "required": false,
          "type": "number",
          "controlType": "text"
        },
        {
          "key": "pendingRegistrants",
          "name": "Pending Registrants",
          "hintText": "Pending Registrants",
          "helpText": "Pending Registrants",
          "isExtendedSchema": false,
          "required": false,
          "type": "number",
          "controlType": "text"
        },
        {
          "key": "deniedRegistrants",
          "name": "Denied Registrants",
          "hintText": "Denied Registrants",
          "helpText": "Denied Registrants",
          "isExtendedSchema": false,
          "required": false,
          "type": "number",
          "controlType": "text"
        },
        {
          "key": "registrationLimit",
          "name": "Registration Limit",
          "hintText": "Registration Limit",
          "helpText": "Registration Limit",
          "isExtendedSchema": false,
          "required": false,
          "type": "number",
          "controlType": "text"
        },
        {
          "key": "webinarSchedulingContext",
          "name": "Webinar Scheduling Context",
          "hintText": "Webinar Scheduling Context",
          "helpText": "Webinar Scheduling Context",
          "isExtendedSchema": false,
          "required": false,
          "type": "string",
          "controlType": "text"
        },
        {
          "key": "webinarID",
          "name": "Webinar ID",
          "hintText": "Webinar ID",
          "helpText": "Webinar ID",
          "isExtendedSchema": false,
          "required": false,
          "type": "string",
          "controlType": "text"
        },
        {
          "key": "isOndemand",
          "name": "Is Ondemand",
          "hintText": "Is Ondemand",
          "helpText": "Is Ondemand",
          "isExtendedSchema": false,
          "required": false,
          "type": "boolean",
          "controlType": "select",
          "pickList": [
            [
              "Yes",
              true
            ],
            [
              "No",
              false
            ]
          ]
        }
      ]
    },

    cancel_webinar_details: {
      description: "Cancel Webinar Details",
      hint: "Cancel a <b>specific webinar (single or series)</b>via <b>GoToWebinar</b>",
      
      input_fields: () => [
        {
          key: "organizerKey",
          name: "Organizer Key",
          hintText: "The unique key for the webinar organizer.",
          required: true,
          type: "string",
          controlType: "text",
        },
        {
          key: "webinarKey",
          name: "Webinar Key",
          hintText: "The unique key for the specific webinar.",
          required: true,
          type: "string",
          controlType: "text",
        },
      ],

      execute: async (connection, input) => {
        try {
          const url = `https://api.getgo.com/G2W/rest/v2/organizers/${input.organizerKey}/webinars/${input.webinarKey}`;
          const headers = {
            Authorization: `Bearer ${connection.oauthToken.accessToken}`,
            "Content-Type": "application/json",
          };

          const response = await request(
            url,
            headers,
            null,
            HttpUtils.HTTPMethods.DELETE
          );

          if (response.success) {
            let isDeleted = {
              "isDeleted" : true
            }
            return successResponse(isDeleted);
          } else {
            return errorResponse(response.body, response.statusCode);
          }
        } catch (error) {
          return errorResponse(error.message);
        }
      },

      output_fields: () => [
        {
          "key": "isDeleted" ,
          "type": "boolean"
        }
      ]
    },
  },
  triggers: {},
  test: async (connection) => {
    try {
      const url = "https://api.getgo.com/identity/v1/Users/me";
      const headers = {
        Authorization: `Bearer ${connection.oauthToken.accessToken}`,
        "Content-Type": "application/json",
      };

      const response = await request(
        url,
        headers,
        null,
        HttpUtils.HTTPMethods.GET
      );

      if (response.success) {
        return successResponse({ message: "Connection successful!" });
      } else {
        return errorResponse(response.body, response.statusCode);
      }
    } catch (error) {
      return errorResponse(error.message);
    }
  },
};

module.exports = app;
