import { Express } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Facility Management API',
      version: '1.0.0',
      description: 'API documentation for Facility Management System - CRUD operations for facility details.',
      contact: {
        name: 'Facility Management Team',
        email: 'support@facility.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    tags: [
      {
        name: 'Facility Details',
        description: 'Facility management operations'
      }
    ],
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.facility.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        FacilityDetails: {
          type: 'object',
          required: [
            'siteName',
            'city',
            'location',
            'clientName',
            'position',
            'contactNo',
            'facilityType'
          ],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated facility ID'
            },
            tenantId: {
              type: 'string',
              description: 'Auto-generated tenant ID'
            },
            siteName: {
              type: 'string',
              description: 'Name of the facility site',
              maxLength: 100
            },
            city: {
              type: 'string',
              description: 'City where facility is located',
              maxLength: 50
            },
            location: {
              type: 'string',
              description: 'Full address of the facility',
              maxLength: 200
            },
            clientName: {
              type: 'string',
              description: 'Name of the client',
              maxLength: 100
            },
            position: {
              type: 'string',
              description: 'Position/designation',
              maxLength: 100
            },
            contactNo: {
              type: 'string',
              description: 'Contact phone number'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address (optional)'
            },
            facilityType: {
              type: 'string',
              enum: ['residential', 'corporate', 'industrial', 'hospitality'],
              description: 'Type of facility'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          },
          example: {
            _id: "507f1f77bcf86cd799439011",
            tenantId: "507f1f77bcf86cd799439012",
            siteName: "Downtown Office Complex",
            city: "New York",
            location: "123 Main Street, Downtown, NY 10001",
            clientName: "John Doe",
            position: "Facility Manager",
            contactNo: "+1-555-123-4567",
            email: "john.doe@example.com",
            facilityType: "corporate",
            createdAt: "2025-09-12T10:30:00Z",
            updatedAt: "2025-09-12T10:30:00Z"
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string',
              example: 'An error occurred'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success'
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    paths: {}
  },
  apis: ['./src/routes/*.ts'], // Path to the API files
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  // Swagger UI setup
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Facility Management API Documentation',
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      showCommonExtensions: true,
      tryItOutEnabled: true
    }
  }));

  // JSON endpoint for raw swagger specs
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 Swagger documentation is available at /api-docs');
};
