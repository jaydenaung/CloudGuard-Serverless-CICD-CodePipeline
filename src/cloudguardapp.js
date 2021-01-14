/**
 * A Lambda function that returns a static string
 */
exports.cloudguardHandler = async () => {
    // If you change this message, you will need to change cloudguardapp.test.js
    const message = 'This serverless app X is protected by CloudGuard!';

    // All log statements are written to CloudWatch
    console.info(`${message}`);
    
    
    return message;
}
