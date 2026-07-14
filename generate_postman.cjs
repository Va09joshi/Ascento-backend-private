const fs = require('fs');

const collectionRaw = fs.readFileSync('./ascento-postman-collection.json', 'utf8');
const collection = JSON.parse(collectionRaw);

const teacherFolder = {
  name: "Teachers",
  item: [
    {
      name: "Create Teacher",
      request: {
        method: "POST",
        header: [
          { key: "Authorization", value: "Bearer {{auth_token}}", type: "text" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            full_name: "John Teacher",
            email: "john.teacher@ascento.com",
            phone: "+919876543210",
            gender: "male"
          }, null, 2),
          options: { raw: { language: "json" } }
        },
        url: {
          raw: "{{base_url}}/api/v1/teachers",
          host: ["{{base_url}}"],
          path: ["api", "v1", "teachers"]
        }
      }
    },
    {
      name: "List Teachers",
      request: {
        method: "GET",
        header: [
          { key: "Authorization", value: "Bearer {{auth_token}}", type: "text" }
        ],
        url: {
          raw: "{{base_url}}/api/v1/teachers",
          host: ["{{base_url}}"],
          path: ["api", "v1", "teachers"]
        }
      }
    },
    {
      name: "Get Teacher By ID",
      request: {
        method: "GET",
        header: [
          { key: "Authorization", value: "Bearer {{auth_token}}", type: "text" }
        ],
        url: {
          raw: "{{base_url}}/api/v1/teachers/:id",
          host: ["{{base_url}}"],
          path: ["api", "v1", "teachers", ":id"],
          variable: [
            { key: "id", value: "UUID" }
          ]
        }
      }
    },
    {
      name: "Update Teacher",
      request: {
        method: "PATCH",
        header: [
          { key: "Authorization", value: "Bearer {{auth_token}}", type: "text" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            full_name: "John Updated"
          }, null, 2),
          options: { raw: { language: "json" } }
        },
        url: {
          raw: "{{base_url}}/api/v1/teachers/:id",
          host: ["{{base_url}}"],
          path: ["api", "v1", "teachers", ":id"],
          variable: [
            { key: "id", value: "UUID" }
          ]
        }
      }
    },
    {
      name: "Deactivate Teacher",
      request: {
        method: "DELETE",
        header: [
          { key: "Authorization", value: "Bearer {{auth_token}}", type: "text" }
        ],
        url: {
          raw: "{{base_url}}/api/v1/teachers/:id",
          host: ["{{base_url}}"],
          path: ["api", "v1", "teachers", ":id"],
          variable: [
            { key: "id", value: "UUID" }
          ]
        }
      }
    }
  ]
};

collection.item.push(teacherFolder);

fs.writeFileSync('./full-postman-collection.json', JSON.stringify(collection, null, 2));
console.log('Successfully generated full-postman-collection.json');
