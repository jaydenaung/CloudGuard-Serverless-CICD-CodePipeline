/**
 * A Lambda function that returns a static string
 */
exports.cloudguardHandler = async () => {
    // If you change this message, you will need to change cloudguard.test.js
    const message = 'Serverless Apps secured by CloudGuard Workload!';

    // All log statements are written to CloudWatch
    console.info(`${message}`);
    
    return message;
}
