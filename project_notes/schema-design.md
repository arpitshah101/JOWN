# Schema Design

User:
* _id: ObjectId (UNIQUE)
* created: Date
* email: String (UNIQUE)
* name: String
* password: String
* roles: String[]
* userId: String (UNIQUE)
* userNum: Number (UNIQUE)

Workflow:
* _id: ObjectId (UNIQUE)
* created: Date
* forms: ObjectId[]
	* 	{
			alias: String,
			fileName: String,
			name: String,
		}
* instances: ObjectId[]
* name: String
* roles/groups: String[]

State:
* _id: ObjectId (UNIQUE)
* action: String
* condition: String
* name: String
* transitions : { condition: String, dest: String }
* workflowId: ObjectId

Instance:
* _id: ObjectId (UNIQUE)
* active: ObjectId[]
* created: Date
* creator: ObjectId
* events: Object[]
* members: ObjectId[]
* status: String? Enum?
* workflowId: ObjectId

Groups:
* _id: ObjectId (UNIQUE)
* members: ObjectId[]
* name: String (UNIQUE)
* public: Boolean

Data:
* forms: ObjectId[]
* instanceData
	* CREATOR: userId
	* STATUS: String
* instanceId: ObjectId (UNIQUE)

Form:
* _id: ObjectId (UNIQUE)
* alias: String
* entities: [{ data: Object, type: String, label: String }]
* fileName: String
* group: String
* name: String
* workflowId: ObjectId

FormData:
* _id: ObjectId (UNIQUE)
* alias: String
* assignedTo: ObjectId
* data: [{ [key: string]: any }]
* instanceId: ObjectId
* lastEdited: Date
* name: String
* status: String