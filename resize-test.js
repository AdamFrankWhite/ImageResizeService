export const handler = async (event, context) => {
    // need to get image from s3 bucket
    // resize image
    // return/pipe image back to user

    return {
        status: 200,
        input: event,
        body: JSON.stringify("yo yo!"),
    };
};
