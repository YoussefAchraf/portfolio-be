/** LAYER docs - public profile OpenAPI fragment. */
export const profilePaths = {
  "/profile": {
    "get": {
      "operationId": "getPublicProfile",
      "summary": "Read the public profile and current CV",
      "responses": {
        "200": {
          "description": "Success",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Profile"
              }
            }
          }
        },
        "404": {
          "description": "NOT_FOUND: missing or invisible resource",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ErrorResponse"
              }
            }
          }
        },
        "422": {
          "description": "VALIDATION_FAILED: invalid input or cursor; details.fields maps fields to translation keys",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ErrorResponse"
              }
            }
          }
        },
        "429": {
          "description": "RATE_LIMITED: request quota exceeded",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ErrorResponse"
              }
            }
          },
          "headers": {
            "Retry-After": {
              "description": "Seconds before retry.",
              "schema": {
                "type": "integer",
                "minimum": 1
              }
            }
          }
        },
        "500": {
          "description": "INTERNAL_ERROR: generic server error",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ErrorResponse"
              }
            }
          }
        }
      },
      "parameters": [
        {
          "name": "lang",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "enum": [
              "en",
              "fr"
            ],
            "default": "en"
          }
        }
      ]
    }
  }
} as const;

export const profileSchemas = {
  "Profile": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "name",
      "headline",
      "pitch",
      "about",
      "availability",
      "location",
      "portrait",
      "socialLinks",
      "seo",
      "cv"
    ],
    "properties": {
      "name": {
        "type": "string",
        "minLength": 1,
        "maxLength": 120
      },
      "headline": {
        "type": "string",
        "minLength": 1,
        "maxLength": 160
      },
      "pitch": {
        "type": "string",
        "minLength": 1,
        "maxLength": 500
      },
      "about": {
        "type": "string",
        "minLength": 1,
        "maxLength": 8000
      },
      "availability": {
        "type": "string",
        "minLength": 1,
        "maxLength": 120
      },
      "location": {
        "type": "string",
        "minLength": 1,
        "maxLength": 160
      },
      "portrait": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "url",
          "alt"
        ],
        "properties": {
          "url": {
            "type": "string",
            "format": "uri-reference",
            "pattern": "^(https://|/[^/])",
            "maxLength": 2048
          },
          "alt": {
            "type": "string",
            "minLength": 1,
            "maxLength": 200
          }
        }
      },
      "socialLinks": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "email",
          "github",
          "linkedin"
        ],
        "properties": {
          "email": {
            "type": "string",
            "format": "email",
            "maxLength": 254
          },
          "github": {
            "type": "string",
            "format": "uri",
            "pattern": "^https://",
            "maxLength": 2048
          },
          "linkedin": {
            "type": "string",
            "format": "uri",
            "pattern": "^https://",
            "maxLength": 2048
          }
        }
      },
      "seo": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "title",
          "description",
          "imageUrl"
        ],
        "properties": {
          "title": {
            "type": "string",
            "minLength": 1,
            "maxLength": 120
          },
          "description": {
            "type": "string",
            "minLength": 1,
            "maxLength": 320
          },
          "imageUrl": {
            "type": "string",
            "format": "uri",
            "pattern": "^https://",
            "maxLength": 2048,
            "nullable": true
          }
        }
      },
      "cv": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "url",
          "label"
        ],
        "properties": {
          "url": {
            "type": "string",
            "format": "uri",
            "pattern": "^https://",
            "maxLength": 2048
          },
          "label": {
            "type": "string",
            "minLength": 1,
            "maxLength": 120
          }
        },
        "nullable": true
      }
    }
  },
  "CvVersion": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "url",
      "label"
    ],
    "properties": {
      "url": {
        "type": "string",
        "format": "uri",
        "pattern": "^https://",
        "maxLength": 2048
      },
      "label": {
        "type": "string",
        "minLength": 1,
        "maxLength": 120
      }
    }
  }
} as const;
