# cloudguard-serverless-app (Jayden)

This project contains source code (zip) and supporting files for a serverless application that you can deploy with the command line interface (CLI) and scripts. We're gonna deploy a sample serverless application. Let's get started

#Pre-requisites
You need the following tools on your computer:

* AWS CLI [Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html).
* AWS SAM CLI - [Install the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html).
* Node.js - [Install Node.js 12](https://nodejs.org/en/), including the npm package management tool.
* Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community).

AWS roles needed to be created for the following services:

* CodeBuild
* CodeDeploy
* CodePipeline 

The roles will be created as part of creating a codepipeline. Please take note that the role used by codebulid requires permission to access to a number of AWS resources such as S3. 

## Deploy the serverless application
First you'll need to create a Codecommit on AWS. You can do it on AWS web console or you can just execute the following command.

```bash
aws codecommit create-repository --repository-name cloudguard-serverless-cicd-codepipeline --repository-description "CloudGuard Serverless CICD Pipeline Demo Pipeline"
```

Then you'll need to do 'git clone your codepipline reop' via either SSH or HTTP.  It'll be an empty repository first. Then you will need to download the soure files (zip) into your local repo [here](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html) 

- Unzip the source files
- Remove the zip file
- Then you'll need to do `git init`, `git add -A`, `git commit -m "Your message"` and `git push`

Locate the `template.yml` file in this project. You can update the template to add AWS resources through the same deployment process that updates your application code.

You'll need to create an S3 bucket.

```bash
aws s3 mb s3://Your-Bucket-Name
```


### Deploy the serverless application user [sam_deploy.sh](https://github.com/jaydenaung/cloudguard-serverless-cicd-codepipeline/blob/master/sam_deploy.sh)

Download the sam_deploy.sh script from this git repo to your local directory, and run it. 

```bash
./sam_deploy.sh
```

Expected output:

```
./sam_deploy.sh
Enter S3 Bucket Name: chkp-jayden-serverless-apps-source
Enter Your CFT Stack Name: chkp-jayden-dev-serverless-app
[Task 1] Packaging your serverless application based on template.yml
Uploading to c3e4be0a0b3cbe688e90f2b571a38f47  373 / 373.0  (100.00%)

Successfully packaged artifacts and wrote output template to file out.yml.
Execute the following command to deploy the packaged template
sam deploy --template-file /Users/jaydenaung/git/serverless/dev-serverless-repo/out.yml --stack-name <YOUR STACK NAME>

[Task 2] Deploying your application now..

	Deploying with following values
	===============================
	Stack name                 : chkp-jayden-dev-serverless-app
	Region                     : None
	Confirm changeset          : False
	Deployment s3 bucket       : None
	Capabilities               : ["CAPABILITY_IAM"]
	Parameter overrides        : {}

Initiating deployment
=====================

Waiting for changeset to be created..

CloudFormation stack changeset
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Operation                                                 LogicalResourceId                                         ResourceType                                            
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
+ Add                                                     helloFromLambdaFunctionRole                               AWS::IAM::Role                                          
+ Add                                                     helloFromLambdaFunction                                   AWS::Lambda::Function                                   
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Changeset created successfully. arn:aws:cloudformation:ap-southeast-1:116489363094:changeSet/samcli-deploy1601635751/a1274a36-42d3-4225-b021-cb3c1fc5d839


2020-10-02 18:49:22 - Waiting for stack create/update to complete

CloudFormation events from changeset
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
ResourceStatus                             ResourceType                               LogicalResourceId                          ResourceStatusReason                     
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
CREATE_IN_PROGRESS                         AWS::IAM::Role                             helloFromLambdaFunctionRole                -                                        
CREATE_IN_PROGRESS                         AWS::IAM::Role                             helloFromLambdaFunctionRole                Resource creation Initiated              
CREATE_COMPLETE                            AWS::IAM::Role                             helloFromLambdaFunctionRole                -                                        
CREATE_IN_PROGRESS                         AWS::Lambda::Function                      helloFromLambdaFunction                    -                                        
CREATE_IN_PROGRESS                         AWS::Lambda::Function                      helloFromLambdaFunction                    Resource creation Initiated              
CREATE_COMPLETE                            AWS::Lambda::Function                      helloFromLambdaFunction                    -                                        
CREATE_COMPLETE                            AWS::CloudFormation::Stack                 chkp-jayden-dev-serverless-app             -                                        
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Successfully created/updated stack - chkp-jayden-dev-serverless-app in None

Your serverless application has been deployed.
```

Now that your cloudformation stack has been deployed, you also have a Lambda function now. Go to AWS Web Console => Cloudformation Tempalte, and take note the ARN of the stack that has just been created. We'll need it later. (It looks like this:  arn:aws:cloudformation:ap-southeast-1:116489363094:stack/chkp-serverless-app/a6d77c70-048a-11eb-8438-02e7c9cae2dc)

## Buildspec.yml

In the Buildsepc.yml, Replace the following values with your own (without []):

1. AWS_REGION=[Your REGION]
2. S3_BUCKET=[YOUR BUCKET NAME]
3. cloudguard fsp -c [The ARN of Your Cloudformation stack you just took note of]

```
version: 0.2

phases:
  install:
    commands:
      # Install all dependencies (including dependencies for running tests)
      - npm install
      - pip install --upgrade awscli
  pre_build:
    commands:
      # Discover and run unit tests in the '__tests__' directory
      #- npm run test
      # Remove all unit tests to reduce the size of the package that will be ultimately uploaded to Lambda
      #- rm -rf ./__tests__
      # Remove all dependencies not needed for the Lambda deployment package (the packages from devDependencies in package.json)
      #- npm prune --production
  build:
    commands:
      # Install the CloudGuard Workload CLI Plugin
      - npm install -g https://artifactory.app.protego.io/cloudguard-serverless-plugin.tgz
      # Set your AWS region variable
      - export AWS_REGION=[Your REGION]
      # Configure the CloudGuard Workload Proact security on the SAM template
      - cloudguard proact -m template.yml
      # Set the S3 bucket name variable
      - export S3_BUCKET=[YOUR BUCKET NAME]
      # Use AWS SAM to package the application by using AWS CloudFormation
      - aws cloudformation package --template template.yml --s3-bucket $S3_BUCKET --output-template template-export.yml
   # commands:
      # Add the FSP Runtime security to the deployed function. Please replace with the function cloudformation arn!
      - cloudguard fsp -c [The ARN of Your Cloudformation stack you just took note of]
artifacts:
  type: zip
  files:
    - template-export.yml
```

## Create a codepipeline

The application template uses AWS SAM to define application resources. AWS SAM is an extension of AWS CloudFormation with a simpler syntax for configuring common serverless application resources, such as functions, triggers, and APIs. For resources that aren't included in the [AWS SAM specification](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md), you can use the standard [AWS CloudFormation resource types](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html).

Update `template.yml` to add a dead-letter queue to your application. In the **Resources** section, add a resource named **MyQueue** with the type **AWS::SQS::Queue**. Then add a property to the **AWS::Serverless::Function** resource named **DeadLetterQueue** that targets the queue's Amazon Resource Name (ARN), and a policy that grants the function permission to access the queue.

```
Resources:
  MyQueue:
    Type: AWS::SQS::Queue
  helloFromLambdaFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/hello-from-lambda.helloFromLambdaHandler
      Runtime: nodejs12.x
      DeadLetterQueue:
        Type: SQS
        TargetArn: !GetAtt MyQueue.Arn
      Policies:
        - SQSSendMessagePolicy:
            QueueName: !GetAtt MyQueue.QueueName
```

The dead-letter queue is a location for Lambda to send events that could not be processed. It's only used if you invoke your function asynchronously, but it's useful here to show how you can modify your application's resources and function configuration.

Deploy the updated application.

```bash
my-application$ sam deploy
```

Open the [**Applications**](https://console.aws.amazon.com/lambda/home#/applications) page of the Lambda console, and choose your application. When the deployment completes, view the application resources on the **Overview** tab to see the new resource. Then, choose the function to see the updated configuration that specifies the dead-letter queue.

## Fetch, tail, and filter Lambda function logs

To simplify troubleshooting, the AWS SAM CLI has a command called `sam logs`. `sam logs` lets you fetch logs that are generated by your Lambda function from the command line. In addition to printing the logs on the terminal, this command has several nifty features to help you quickly find the bug.

**NOTE:** This command works for all Lambda functions, not just the ones you deploy using AWS SAM.

```bash
my-application$ sam logs -n helloFromLambdaFunction --stack-name sam-app --tail
```

**NOTE:** This uses the logical name of the function within the stack. This is the correct name to use when searching logs inside an AWS Lambda function within a CloudFormation stack, even if the deployed function name varies due to CloudFormation's unique resource name generation.

You can find more information and examples about filtering Lambda function logs in the [AWS SAM CLI documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-logging.html).

## Unit tests

Tests are defined in the `__tests__` folder in this project. Use `npm` to install the [Jest test framework](https://jestjs.io/) and run unit tests.

```bash
my-application$ npm install
my-application$ npm run test
```

## Cleanup

To delete the sample application that you created, use the AWS CLI. Assuming you used your project name for the stack name, you can run the following:

```bash
aws cloudformation delete-stack --stack-name cloudguard-serverless-app
```

## Resources

For an introduction to the AWS SAM specification, the AWS SAM CLI, and serverless application concepts, see the [AWS SAM Developer Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html).

Next, you can use the AWS Serverless Application Repository to deploy ready-to-use apps that go beyond Hello World samples and learn how authors developed their applications. For more information, see the [AWS Serverless Application Repository main page](https://aws.amazon.com/serverless/serverlessrepo/) and the [AWS Serverless Application Repository Developer Guide](https://docs.aws.amazon.com/serverlessrepo/latest/devguide/what-is-serverlessrepo.html).
