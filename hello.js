export const handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message: "Hello Hello!",
                input: event,
            },
            null,
            2
        ),
    };
};
