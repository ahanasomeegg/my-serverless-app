## Serverless REST Assignment - Distributed Systems.
​
__Name:__ ....Duan Li.....
​
__Demo:__ ... link to your YouTube video demonstration ......
​
### Context.
​
State the context you chose for your web API and detail the attributes of the DynamoDB table items, e.g.
​
Context: Movie Cast
​
Table item attributes:
+ MovieID - number  (Partition key)
+ ActorID - number  (Sort Key)
+ RoleName - string
+ RoleDescription - string
+ AwardsWon - List<string>
+ etc
​
### App API endpoints.
​
[ Provide a bullet-point list of the app's endpoints (excluding the Auth API) you have successfully implemented. ]
e.g.
 
+ POST /thing - add a new 'thing'.
+ GET /thing/{partition-key}/ - Get all the 'things' with a specified partition key.
+ GEtT/thing/{partition-key}?attributeX=value - Get all the 'things' with a specified partition key value and its attributeX satisfying the condition .....
+ etc
​
​
### Features.
​
#### Translation persistence (if completed)
​
[ Explain briefly your solution to the translation persistence requirement - no code excerpts required. Show the structure of a table item that includes review translations, e.g.
​
+ MovieID - number  (Partition key)
+ ActorID - number  (Sort Key)
+ RoleName - string
+ RoleDescription - string
+ AwardsWon - List<string>
+ Translations - ?
]
​

​
#### API Keys. (if completed)
​
[Explain briefly how to implement API key authentication to protect API Gateway endpoints. Include code excerpts from your app to support this. ][]
​
~~~ts
// This is a code excerpt markdown 
let foo : string = 'Foo'
console.log(foo)
~~~
​
​
