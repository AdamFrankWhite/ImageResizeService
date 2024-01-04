# Responsive Image Resize Service 

Enables user to upload an image, with three copies of different sizes uploaded to an S3 bucket. Built with Node, GraphQL, Serverless framework and deployed using AWS Lambda.  

### Features

- Resized image retrieval based on user input parameters
Example:
```
$ endpoint.com/resize?src=image.jpg&w=250&h=200
```

- Different sized images automatically uploaded to S3 bucket

- User registration and image library access
