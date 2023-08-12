export const handler = async (event, context) => {
    // need to get image from s3 bucket
    // resize image
    // return/pipe image back to user

    return {
        status: 200,

        body: JSON.stringify("yo yo!", null, 2),

        isBase64Encoded: true,
    };
};
