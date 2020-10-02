#!/bin/bash

read -p "Enter S3 Bucket Name: " s3bucket
read -p "Enter Your CFT Stack Name: " stackname

echo "[Task 1] Packaging your serverless application based on template.yml"
sam package --template-file template.yml --s3-bucket $s3bucket --output-template-file out.yml

echo "[Task 2] Deploying your application now.."
sam deploy --template-file ./out.yml --stack-name $stackname --capabilities CAPABILITY_IAM

echo "Your serverless application has been deployed."
